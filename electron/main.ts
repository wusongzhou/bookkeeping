/**
 * Electron Main Process
 * 应用程序主进程，管理窗口和数据库
 */

import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initDatabase, getDatabasePath, closeDatabase } from './database/sqlite';
import { registerDbHandlers } from './ipc/db-handlers';

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

/**
 * 创建主窗口
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 加载应用
  if (isDev) {
    // 开发环境：加载 Next.js 开发服务器
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境：加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * 应用就绪时的处理
 */
app.whenReady().then(() => {
  console.log('Electron 应用启动中...');
  console.log('开发模式:', isDev);

  // 初始化数据库
  const dbPath = getDatabasePath(isDev, app.getPath('userData'));
  console.log('数据库路径:', dbPath);
  initDatabase(dbPath);

  // 注册 IPC 处理器
  registerDbHandlers();

  // 创建窗口
  createWindow();

  // macOS 特殊处理
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * 所有窗口关闭时
 */
app.on('window-all-closed', () => {
  // macOS 上除非用户明确退出，否则保持应用运行
  if (process.platform !== 'darwin') {
    closeDatabase();
    app.quit();
  }
});

/**
 * 应用退出前
 */
app.on('before-quit', () => {
  closeDatabase();
});

/**
 * 处理未捕获的异常
 */
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('未处理的 Promise 拒绝:', reason);
});
