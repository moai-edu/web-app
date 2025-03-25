import dotenv from "dotenv";
import path from "path";

// 加载 .env 文件
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// 加载 .env.local 文件（如果存在）
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
