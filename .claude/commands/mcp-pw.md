---
description: Connect to Electron app via MCP and take screenshot
allowed-tools: mcp__electron-playwright__browser_tab_list, mcp__electron-playwright__browser_take_screenshot
---

Connect to the running Electron app at localhost:5173 via MCP and take a screenshot of the current state.

1. Check available tabs using  
   `mcp__electron-playwright__browser_tab_list`

2. take a screenshot using  
   `cp__electron-playwright__browser_take_screenshot`

**IMPORTANT**: Do NOT use browser_navigate. The app already has an open page.

3. MCP response is Japanese Language. 日本語で返信してください。