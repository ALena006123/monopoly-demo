# China Monopoly Demo / 中国城市大富翁 Demo

作者：韩逸雪  
Author: Alena Han

## Project Introduction / 项目介绍

China Monopoly Demo is a React + Vite web game inspired by classic Monopoly.  
The game uses Chinese cities as board spaces and includes property purchase, regional color groups, rent, house building, transport assets, chance cards, trading, debt handling, and bankruptcy rules.

中国城市大富翁 Demo 是一个基于 React + Vite 制作的网页小游戏，参考经典大富翁玩法，并结合中国城市主题进行设计。  
玩家可以购买城市、收取过路费、买齐同色地区后建房升级，也可以购买交通资产、触发机会事件、进行玩家交易，并处理负债和破产规则。

## Live Website / 在线打开网站

You can play the deployed version here:

国内访问链接：

https://monopoly-demo-d8gpjvahxd47588ca-1443062397.tcloudbaseapp.com

Vercel preview link:

https://monopoly-demo.vercel.app/

Note: Vercel may load slowly in some network environments. The Tencent CloudBase link is recommended for users in China.

说明：Vercel 在部分国内网络环境下可能加载较慢，国内访问建议使用腾讯云 CloudBase 链接。

## How to Run Locally / 本地打开方式

If you want to run this project on your own computer, follow these steps.

如果想在自己电脑本地打开项目，可以按照下面步骤运行。

### 1. Install dependencies / 安装依赖

```bash
npm install
```

### 2. Start the development server / 启动项目

```bash
npm run dev
```

### 3. Open the website / 打开网页

After running the command, the terminal will show a local URL, usually like:

```bash
http://localhost:5173/
```

Open that URL in your browser.

运行命令后，终端会显示一个本地网址，通常是：

```bash
http://localhost:5173/
```

把这个网址复制到浏览器里打开即可。

## Features / 功能

- 2-4 player game setup  
  支持 2-4 名玩家开局

- Dice rolling and animated player movement  
  掷骰子并带有玩家移动动画

- China city-themed Monopoly board  
  中国城市主题的大富翁棋盘

- Property purchase and rent system  
  城市购买与过路费机制

- Regional color groups  
  同地区城市使用相同颜色

- Build houses after owning all cities in the same region  
  买齐同色地区后才可以建房升级

- Dynamic rent table for empty land and 1-3 houses  
  空地、1 间房、2 间房、3 间房对应不同过路费

- Transport assets: gas station, high-speed rail station, airport  
  交通资产：加油站、高铁站、飞机场

- Chance cards and special events  
  机会 / 命运随机事件

- Player-to-player trading system  
  玩家之间可以交易资产

- Debt handling and bankruptcy rules  
  负债后可卖资产还钱，无法还清则破产

## Tech Stack / 技术栈

- React
- JavaScript
- CSS
- Vite

## Project Goal / 项目目标

This project was built as a front-end demo to practice React state management, component-based UI development, game logic, layout design, and interactive user experience.

这个项目用于练习前端开发中的 React 状态管理、组件化开发、游戏规则逻辑、页面布局和交互体验设计。
