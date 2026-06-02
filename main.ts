import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  requestUrl,
  RequestUrlParam,
  Setting,
  TFolder,
  normalizePath,
} from "obsidian";

interface ReadItSoonSettings {
  token: string;
  folder: string;
  pollIntervalMinutes: number;
  serverUrl: string;
}

interface ReadItSoonArticle {
  id: number;
  title: string | null;
  author: string | null;
  source: string | null;
  saved_at: string;
  markdown: string;
}

const DEFAULT_SETTINGS: ReadItSoonSettings = {
  token: "",
  folder: "ReadItSoon",
  pollIntervalMinutes: 1,
  serverUrl: "https://readitsoon.chiq.me",
};

export default class ReadItSoonPlugin extends Plugin {
  settings: ReadItSoonSettings;
  private pollTimer: number | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addRibbonIcon("download", "Sync ReadItSoon articles", () => {
      this.syncArticles();
    });

    this.addCommand({
      id: "sync-readitsoon-articles",
      name: "Sync articles now",
      callback: () => this.syncArticles(),
    });

    this.addSettingTab(new ReadItSoonSettingTab(this.app, this));
    this.startPolling();
  }

  onunload(): void {
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.startPolling();
  }

  async syncArticles(): Promise<void> {
    if (!this.settings.token.trim()) {
      new Notice("ReadItSoon token is missing");
      return;
    }

    try {
      const articles = await this.fetchArticles();
      await this.ensureFolder(this.settings.folder);

      let saved = 0;
      for (const article of articles) {
        await this.saveArticle(article);
        await this.markDownloaded(article.id);
        saved += 1;
      }

      new Notice(saved === 0 ? "No new ReadItSoon articles" : `Synced ${saved} ReadItSoon article${saved === 1 ? "" : "s"}`);
    } catch (error) {
      new Notice(`ReadItSoon sync failed: ${this.errorMessage(error)}`);
    }
  }

  private startPolling(): void {
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    const minutes = Number(this.settings.pollIntervalMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return;

    this.pollTimer = window.setInterval(() => {
      this.syncArticles();
    }, minutes * 60 * 1000);
  }

  private async fetchArticles(): Promise<ReadItSoonArticle[]> {
    const response = await requestUrl(this.requestParams("/api/obsidian/articles", "GET"));
    if (response.status !== 200) throw new Error(`HTTP ${response.status}`);

    return response.json as ReadItSoonArticle[];
  }

  private async markDownloaded(articleId: number): Promise<void> {
    const response = await requestUrl(this.requestParams(`/api/obsidian/articles/${articleId}/downloaded`, "POST"));
    if (response.status < 200 || response.status >= 300) throw new Error(`downloaded marker failed: HTTP ${response.status}`);
  }

  private requestParams(path: string, method: "GET" | "POST"): RequestUrlParam {
    return {
      url: `${this.settings.serverUrl.replace(/\/+$/, "")}${path}`,
      method,
      headers: {
        Authorization: `Bearer ${this.settings.token.trim()}`,
      },
    };
  }

  private async saveArticle(article: ReadItSoonArticle): Promise<void> {
    const folder = normalizePath(this.settings.folder.trim());
    const baseName = this.sanitizeFileName(article.title || "Untitled article");
    const path = await this.availablePath(folder, baseName);
    const content = this.articleFileContent(article);

    await this.app.vault.create(path, content);
  }

  private articleFileContent(article: ReadItSoonArticle): string {
    const title = article.title || "Untitled article";
    const author = article.author || "";
    const source = article.source || "";

    return [
      "---",
      `title: ${JSON.stringify(title)}`,
      `author: ${JSON.stringify(author)}`,
      `source: ${JSON.stringify(source)}`,
      `saved_at: ${JSON.stringify(article.saved_at)}`,
      "---",
      "",
      article.markdown.trim(),
      "",
    ].join("\n");
  }

  private async availablePath(folder: string, baseName: string): Promise<string> {
    let candidate = normalizePath(`${folder}/${baseName}.md`);
    let index = 2;

    while (this.app.vault.getAbstractFileByPath(candidate)) {
      candidate = normalizePath(`${folder}/${baseName} ${index}.md`);
      index += 1;
    }

    return candidate;
  }

  private async ensureFolder(path: string): Promise<void> {
    const normalized = normalizePath(path.trim());
    if (!normalized) return;

    const parts = normalized.split("/").filter(Boolean);
    let current = "";

    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      const existing = this.app.vault.getAbstractFileByPath(current);

      if (existing instanceof TFolder) continue;
      if (existing) throw new Error(`${current} exists and is not a folder`);

      await this.app.vault.createFolder(current);
    }
  }

  private sanitizeFileName(title: string): string {
    const sanitized = title
      .replace(/[\\/:*?"<>|#^\[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return sanitized || "Untitled article";
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}

class ReadItSoonSettingTab extends PluginSettingTab {
  plugin: ReadItSoonPlugin;

  constructor(app: App, plugin: ReadItSoonPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Token")
      .setDesc("Paste token from the ReadItSoon Obsidian setup page.")
      .addText((text) => text
        .setPlaceholder("20 character token")
        .setValue(this.plugin.settings.token)
        .onChange(async (value) => {
          this.plugin.settings.token = value.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Folder")
      .setDesc("Vault folder where synced articles are saved.")
      .addText((text) => text
        .setPlaceholder("ReadItSoon")
        .setValue(this.plugin.settings.folder)
        .onChange(async (value) => {
          this.plugin.settings.folder = value.trim() || DEFAULT_SETTINGS.folder;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Poll interval")
      .setDesc("Minutes between automatic syncs. Set 0 to disable polling.")
      .addText((text) => text
        .setPlaceholder("1")
        .setValue(String(this.plugin.settings.pollIntervalMinutes))
        .onChange(async (value) => {
          const minutes = Number(value);
          this.plugin.settings.pollIntervalMinutes = Number.isFinite(minutes) && minutes >= 0 ? minutes : DEFAULT_SETTINGS.pollIntervalMinutes;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Server URL")
      .setDesc("Use production URL or a local development server.")
      .addText((text) => text
        .setPlaceholder(DEFAULT_SETTINGS.serverUrl)
        .setValue(this.plugin.settings.serverUrl)
        .onChange(async (value) => {
          this.plugin.settings.serverUrl = value.trim() || DEFAULT_SETTINGS.serverUrl;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Test connection")
      .addButton((button) => button
        .setButtonText("Sync now")
        .onClick(async () => {
          await this.plugin.syncArticles();
        }));
  }
}
