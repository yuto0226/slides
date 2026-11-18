---
theme: '@yuto0226/flourish'
titleTemplate: '%s'
layout: cover
title: NTHU ISLab 讀書會
subtitle: 2026-11-18 · Yuto
info: Di Pietro et al., ASIA CCS 2025 導讀：野外的 process injection 與偵測條件
preview: 5
---

# NTHU ISLab 讀書會

---
layout: default
---

# Can You Run My Code?

<PaperCard
  title="Can You Run My Code? A Close Look at Process Injection in Windows Malware"
  authors="Giorgia Di Pietro, Daniele Cono D’Elia, Leonardo Querzoni"
  affiliation="Sapienza University of Rome"
  venue="ACM ASIA CCS"
  year="2025"
  doi="10.1145/3708821.3736206"
/>

- 野外的 injection 怎麼寫、有多普遍
- 偵測不列舉手法，改以==核心操作==為準
- 2017–2023、56,340 個樣本、2,667 個家族

---
layout: default
---

# 怎麼繞過偵測？

EDR/AV 的靜態偵測掃檔案特徵，動態偵測看事件與 API 呼叫。

- 加殼、變形
  - 程式碼加密或編碼，執行時才在記憶體還原，磁碟上的 bytes 每次都不同
- 不落地（fileless）
  - payload 只存在記憶體，磁碟上沒有檔案可以掃
- ==借用合法 process==
  - 邏輯在合法 process 裡執行，靜態掃到合法簽章，動態的事件落在其基線內
  - e.g. LOLBAS

---
layout: default
---

# 為什麼選 process injection？

- 事件歸屬給目標 process
  - 程式碼在目標 process 的 address space 執行，紀錄掛在其 PID 與 image path 上
- 以目標 process 的 access token 執行
  - 使用者、群組、privileges 與 integrity level 一併取得
- 沿用目標 process 已有的存取權
  - 已開啟的 handle，以及防火牆與應用程式白名單上的例外

靜態比對沒有差異，只剩跨 process 的呼叫序列可以當依據。

---
layout: two-cols
left: 16
clicks: 3
---

# DLL Injection

惡意程式只寫進一個路徑字串，==把 DLL 載入記憶體的是目標 process 自己的 loader==[^repo]。

::left::

1. 配置一塊記憶體
2. 寫入 ==DLL 的路徑字串==
3. 建立遠端執行緒，載入惡意 DLL

::right::

<ProcMap
  :left-slots="[{ row: 0, label: 'malware.exe', tone: 'plain' }]"
  :right-slots="[
    { row: 0, label: 'target.exe', tone: 'plain' },
    { row: 1, tone: 'none' },
    { row: 2, label: 'LoadLibraryA', tone: 'plain' },
  ]"
  :steps="[
    { api: 'VirtualAllocEx', row: 1, set: { tone: 'ghost' } },
    { api: 'WriteProcessMemory', row: 1, set: { label: '&quot;evil.dll&quot;', tone: 'danger' } },
    { api: 'CreateRemoteThread', row: 2, set: { lit: true }, link: { toRow: 1, label: '當參數' } },
  ]"
  :from-click="1"
/>

[^repo]: fdiskyou, ["injectAllTheThings"](https://github.com/mgeeky/injectAllTheThings), `t_CreateRemoteThread.cpp`. 該專案收了七種 DLL injection 實作，原 repo 已下架，連結為 mirror。

---
layout: two-cols
left: 16
clicks: 4
---

# Process Hollowing

process 的路徑與命令列都合法，==換掉的只有記憶體內容==[^leitch]。

::left::

1. 清空目標 process 原本的 image
2. 寫入自己的 payload
3. 把執行緒的進入點改指過去

::right::

<ProcMap
  :left-slots="[
    { row: 0, label: 'malware.exe', tone: 'plain' },
    { row: 1, label: 'payload', tone: 'own' },
  ]"
  :right-slots="[
    { row: 0, label: 'target.exe', tone: 'plain' },
    { row: 2, label: '主執行緒', tone: 'plain' },
  ]"
  :steps="[
    { api: 'CreateProcess(SUSPENDED)', row: -1 },
    { api: 'NtUnmapViewOfSection', row: 0, set: { label: '已清空', tone: 'ghost' } },
    { api: 'WriteProcessMemory', row: 0, set: { label: 'payload', tone: 'danger' } },
    { api: 'SetThreadContext', row: 2, set: { lit: true }, link: { toRow: 0, label: '進入點' } },
  ]"
  :right-at="0"
  :from-click="1"
/>

[^leitch]: 流程取自 J. Leitch, ["Process Hollowing"](https://new.dc414.org/wp-content/uploads/2011/01/Process-Hollowing.pdf), 2011. 這個技術的原始出處。

---
layout: two-cols
left: 16
clicks: 3
---

# Thread Execution Hijacking

借用目標 process 既有的執行緒，==trace 裡不會出現 `CreateRemoteThread`==[^hijack]。

::left::

1. 暫停目標 process 的一條執行緒
2. 寫入 shellcode
3. 把指令指標改指過去，恢復執行

::right::

<ProcMap
  :left-slots="[
    { row: 0, label: 'malware.exe', tone: 'plain' },
    { row: 1, label: 'shellcode', tone: 'own' },
  ]"
  :right-slots="[
    { row: 0, label: 'target.exe', tone: 'plain' },
    { row: 1, tone: 'none' },
    { row: 2, label: '既有執行緒', tone: 'plain' },
  ]"
  :steps="[
    { api: 'SuspendThread', row: 2, set: { note: '暫停中' } },
    { api: 'WriteProcessMemory', row: 1, set: { label: 'shellcode', tone: 'danger' } },
    { api: 'SetThreadContext', row: 2, set: { lit: true }, link: { toRow: 1, label: 'RIP' } },
  ]"
  :from-click="1"
/>

[^hijack]: 流程取自 fdiskyou, ["injectAllTheThings"](https://github.com/mgeeky/injectAllTheThings), `t_suspendInjectResume.cpp`.

---
layout: default
---

# 三種技術的呼叫鏈

<ApiSeq
  :techniques="[
    {
      name: 'DLL Injection',
      calls: [
        { api: 'OpenProcess' },
        { api: 'VirtualAllocEx', stage: 'alloc' },
        { api: 'WriteProcessMemory', stage: 'write' },
        { api: 'GetProcAddress' },
        { api: 'CreateRemoteThread', stage: 'exec' },
        { api: 'WaitForSingleObject' },
      ],
    },
    {
      name: 'Process Hollowing',
      calls: [
        { api: 'CreateProcess(SUSPENDED)' },
        { api: 'GetThreadContext' },
        { api: 'ReadProcessMemory' },
        { api: 'NtUnmapViewOfSection' },
        { api: 'VirtualAllocEx', stage: 'alloc' },
        { api: 'WriteProcessMemory', stage: 'write' },
        { api: 'SetThreadContext', stage: 'exec' },
        { api: 'ResumeThread' },
      ],
    },
    {
      name: 'Thread Hijacking',
      calls: [
        { api: 'OpenProcess' },
        { api: 'OpenThread' },
        { api: 'SuspendThread' },
        { api: 'VirtualAllocEx', stage: 'alloc' },
        { api: 'WriteProcessMemory', stage: 'write' },
        { api: 'GetThreadContext' },
        { api: 'SetThreadContext', stage: 'exec' },
        { api: 'ResumeThread' },
      ],
    },
  ]"
/>

灰色的 API 對偵測沒有鑑別力，==核心操作無法被取代==。[^1][^2][^3]

{.font-note}

[^1]: fdiskyou, ["injectAllTheThings"](https://github.com/mgeeky/injectAllTheThings), `t_CreateRemoteThread.cpp`.

[^2]: J. Leitch, ["Process Hollowing"](https://new.dc414.org/wp-content/uploads/2011/01/Process-Hollowing.pdf), 2011. 這是這個技術的原始出處，MITRE T1055.012 也是引它。

[^3]: fdiskyou, ["injectAllTheThings"](https://github.com/mgeeky/injectAllTheThings), `t_suspendInjectResume.cpp`.

---
layout: statement
---

怎麼寫規則才可以++偵測++三種技術？

---
layout: two-cols
left: 20
---

# Behavioral Signature

::left::

Starink et al. 為 17 種已知技術各寫一條 behavior graph 規則[^1]，在 2017–2021 的樣本上量到至少 ==9.1%== 出現注入行為。

規則已經要求寫入落在==剛配置的範圍內==，但同時要求整條技術特定的鏈到齊[^gh]。

> [!DEFINITION] Petri net
> 轉移要等輸入節點**全部到齊**才能觸發。模型編得了「某個呼叫發生了」，==編不了「某個呼叫沒有發生」==。

::right::

<RuleMatch
  :nodes="[
    { api: 'VirtualAllocEx', stage: 'alloc' },
    { api: 'WriteProcessMemory', stage: 'write' },
    { api: 'CreateRemoteThread', stage: 'exec' },
  ]"
  :trace="[
    { api: 'OpenProcess' },
    { api: 'VirtualAllocEx', node: 0 },
    { api: 'WriteProcessMemory', node: 1 },
    { api: 'GetProcAddress' },
    { api: 'CreateRemoteThread', node: 2 },
    { api: 'WaitForSingleObject' },
  ]"
/>

[^1]: J. Starink et al., ["Understanding and Measuring Inter-process Code Injection in Windows Malware"](https://doi.org/10.1007/978-3-031-64954-7_25), in _Proc. SecureComm_, 2023, pp. 490–514.

[^gh]: 規則原始程式碼見 [utwente-scs/code-injection-malware](https://github.com/utwente-scs/code-injection-malware) 的 `Behaviors/*.behavior`；論文稱 17 種，repo 內只有 13 條。

---
layout: two-cols-header
---

# 不同實作的差異

::left::

### 原始版本

1. `CreateProcess(SUSPENDED)`
2. `NtUnmapViewOfSection`
3. `VirtualAllocEx`
4. `WriteProcessMemory`
5. `SetThreadContext`

::right::

### `neurevt`

1. `CreateProcess(SUSPENDED)`
2. `NtUnmapViewOfSection`
3. `NtCreateSection`
4. ++`NtMapViewOfSection`++{.solid .danger} 映射進自己
5. ++`NtMapViewOfSection`++{.solid .danger} 映射進目標
6. `SetThreadContext`

::bottom::

==`VirtualAllocEx`== 和 ==`WriteProcessMemory`== 被替換，**規則一個節點都對不上**。

---
layout: two-cols-header
left: 20
---

# 偵測條件

`neurevt` 替換掉部分 API，但核心操作不變。

::left::

> [!DEFINITION] operational primitive
> 用**效果**定義，不綁 API 名字。判定依據是==目標 process 與位址==。

- 正常程式同樣會配置與寫入，但==不會集中在同一段位址==
- 放寬到==任兩個操作==，位址一致仍是必要條件

::right::

| 變體      | 配置 | 寫入 | 觸發執行 | 判定 |
| --------- | ---- | ---- | -------- | ---- |
| 原始版本  | ✓    | ✓    | ✓        | 命中 |
| `neurevt` | —    | ✓    | ✓        | 命中 |

::bottom::

注入樣本中 19.9% 只出現兩個操作，Process Hollowing 是 36.1%。

---
layout: default
---

# Elastic 的端點規則

同樣用位址關聯跨 process 的呼叫，比論文早一年公開[^elastic]：

```kql
sequence by process.entity_id, process.Ext.api.parameters.address, Target.process.pid
[
     api where process.Ext.api.behaviors == "cross-process"
     and process.Ext.api.name in (
               "VirtualAllocEx",
               "MapViewOfFile",
               "VirtualProtectEx"
     )
     and process.Ext.api.parameters.protection like "*X*"
]
[api where process.Ext.api.name == "WriteProcessMemory"]
```

配置與寫入兩段，沒有觸發執行，正好是論文放寬後的==任兩個操作==。
Sysmon 沒有==配置與寫入==的事件，Sigma 與 Splunk 只能從 `CreateRemoteThread` 下手[^rules]。

[^rules]: 清點 [SigmaHQ/sigma](https://github.com/SigmaHQ/sigma) 與 [splunk/security_content](https://github.com/splunk/security_content)，2026-11.

[^elastic]: Elastic, ["Potential Remote Code Injection"](https://github.com/elastic/protections-artifacts/blob/main/behavior/rules/windows/defense_evasion_potential_remote_code_injection.toml)，2024-07，端點行為規則，節選。

---
layout: two-cols-header
---

# BluePill

::left::

### 框架本身

- D'Elia et al. 2020 的動態分析框架[^bp]
- 建在 Intel Pin 的插樁（DBI）上
- 作者多 hook library 和 system call
- 逐次記下參數、目標 process 與位址

::right::

### 選用理由

- 沙箱只記 API 名稱，沒有==位址==
- BluePill 內建反規避
- 同一批 2019 年樣本，Detours ==6.2%==、BluePill ==11.8%==

[^bp]: D. C. D'Elia, E. Coppa, F. Palmaro, and L. Cavallaro, ["On the Dissection of Evasive Malware"](https://doi.org/10.1109/TIFS.2020.2976559), _IEEE TIFS_, 2020. 本篇的工具與資料集 [Sap4Sec/process-injection](https://github.com/Sap4Sec/process-injection)，CC BY 4.0。

---
layout: two-cols-header
---

# 實驗設定

::left::

### 惡意樣本

- 56,340 個，每個執行 4 分鐘
- 5 台 VirtualBox VM Windows 7
- 每次執行後還原快照

::right::

### 良性對照

- 522 個 Windows 系統程式
  - VirusTotal 篩除 55 個
- 20 個常用程式
  - 瀏覽器、Office、媒體播放器

::bottom::

開銷以 Wine conformance tests 與 12 個常用 DLL 的 workload 量測

---
layout: default
---

# 野外的注入比例

<YearBars
  :data="[
    { year: 2017, rate: 22.6 },
    { year: 2018, rate: 12.3 },
    { year: 2019, rate: 11.8 },
    { year: 2020, rate: 10.7 },
    { year: 2021, rate: 11.0 },
    { year: 2022, rate: 29.1 },
    { year: 2023, rate: 20.8 },
  ]"
  :mark="2022"
/>

56,340 個樣本中有 9,314 個出現注入行為，==16.5%==。

逐年落在 10.7% 到 29.1%，2022 年改用 Bazaar[^t1]。

[^t1]: 論文 Table 1。2017–2021 取自 VirusTotal，2022–2023 取自 Bazaar。

---
layout: default
---

# 技術的消長

<TechTrend
  :years="[2017, 2018, 2019, 2020, 2021, 2022, 2023]"
  :series="[
    { name: 'Process Hollowing', tone: 'lead', values: [69.6, 48.9, 35.1, 26.1, 27.5, 89.6, 96.0] },
    { name: 'PE Injection', tone: 'plain', values: [4.6, 19.8, 20.8, 33.7, 8.5, 7.3, 3.3] },
    { name: 'Shellcode Injection', tone: 'dim', values: [5.6, 25.2, 17.0, 13.2, 11.0, 1.1, 0.3] },
    { name: 'Passive Injection', tone: 'faint', values: [2.7, 5.1, 20.1, 26.6, 40.5, 1.9, 0.6] },
    { name: 'Early Bird', tone: 'ghost', values: [12.2, 0.0, 0.1, 0.0, 0.2, 0.0, 0.1] },
  ]"
/>

占該年注入樣本的比例。其餘七種技術合計 5.9%。

---
layout: default
---

# no-unmap 變體

<HollowLayout />

<br/>Hollowing 樣本中==約一半==不呼叫 unmap，**過去的規則將它視為必要條件**[^sk]。

[^sk]: 經查其規則原始程式碼：Hollowing 的 `NtSetContextThread` 有一個輸入 place 只由 unmap 產生，少了就到不了 accepting；而 Thread Hijacking 接受以 `NtCreateUserProcess` 取得 process 與執行緒。no-unmap 只會命中後者。

---
layout: default
---

# 野外到底有多少？

| 研究                       | 樣本                      | 2017 年注入比例 |
| -------------------------- | ------------------------- | --------------- |
| Korczynski & Yin 2017[^ky] | 934，==≥40 家 AV 標記==   | ==40%==         |
| 本篇 2025                  | 56,340，依家族平衡        | 22.6%           |
| Starink et al. 2023        | 47,128 隨機，==≥3 家 AV== | ==8.3%==        |

同一年的野外差五倍。執行時間是 600、240、360 秒，不是主因。

[^ky]: D. Korczynski and H. Yin, ["Capturing Malware Propagations with Code Injections and Code-Reuse Attacks"](https://doi.org/10.1145/3133956.3134099), in _Proc. CCS_, 2017. 以全系統污點追蹤判定，定義比 API 比對寬。

---
layout: default
---

# 技術組成的落差

| 技術                | Starink et al. | 本篇      |
| ------------------- | -------------- | --------- |
| Process Hollowing   | 22.2%          | ==65.5%== |
| 登錄檔類（Passive） | ==56.7%==      | 8.5%      |
| Thread Hijacking    | 8.2%           | 1.3%      |

分母是各自的注入樣本。作者解釋了總量的落差，沒有解釋組成。

---
layout: two-cols-header
---

# 注入的對象

::left::

### 注入既有 process

- Shellcode 與 PE injection 的 ==83.2%==
- `svchost.exe` 48.3%
- `explorer.exe` 33.2%

::right::

### Process Hollowing

- ==45.3%== 注入自己的複本
- 28.6% 注入系統原生程式

::bottom::

96.8% 的樣本只用一種技術，85.2% 只做一次注入。

---
layout: default
---

# 家族層級

2,667 個家族中，576 個（==21.6%==）至少有一個樣本注入。

- 用不用注入，家族內部並不一致
  - 有注入的家族裡，只有 39/482（==8.1%==）的樣本全部都注入
  - 跨年出現的家族，只有 ==20.6%== 每一年都注入
- 用哪一個技術，反而比較穩定
  - 138/251（==55.0%==）的家族至少有一個技術始終一致
- 家族之間落差極大
  - `reline` 99.3%、`stop` 64.5%，`dealply` 與 `allaple` 是 0

---
layout: default
---

# 誤判

- 467 個 Windows 系統程式：==0 個==
- 20 個複雜程式：==3 個==（Chrome、Firefox ESR、Skype）

偵測條件不使用白名單，僅依據位址與時間的吻合。相較之下，前面那條 Elastic 規則的 82 行查詢裡，==15 條路徑與 44 個 SHA-256== 是排除清單[^ex]。

[^ex]: 同前引 Elastic 規則全文，統計自 2026-11 的 `main` 版本。

---
layout: default
---

# 既有方案的漏判

| 對照對象                    | 漏判  | 其中只出現兩個操作 |
| --------------------------- | ----- | ------------------ |
| 商用（VirusTotal 行為報告） | 24.0% | 29.4%              |
| 開源（CAPE + `malfind`）    | 18.3% | 13.7%              |

漏判比例的分母是本方法偵測到的注入樣本，平均 ==21.2%==。

---
layout: default
---

# 侷限性

- 注入比例 16.5% 是下限
  - 樣本具備 anti-debug、anti-VM 與 timing 檢查，或需特定觸發條件才執行
  - BluePill 無法滿足所有條件
- 只看得到 userspace
  - 走 kernel 的樣本不經過這些 API
- 複雜程式會誤判
  - Chrome、Firefox ESR、Skype 會開 suspended 子 process 再寫入可執行記憶體
  - resume 的位置不在該範圍內，執行那一步被丟掉，配置與寫入仍然成立
- 資料來源更換
  - VirusTotal Academic 於 2021 年後停止更新，2022 年起改用 Bazaar
  - 2021 年的樣本改用 Bazaar，注入比例從 ==11.0%== 變成 ==31.6%==

---
layout: default
---

# 這篇之後

- Wang et al. 2026 改在 kernel 攔截
  - XMemGuard 以 ETW 在 syscall 派送前攔下跨 process 呼叫，直接移除執行位元[^xmg]
- Salvatori et al. 2026 打 ==process-centric== 的前提
  - 遙測把每個事件掛在單一 process 底下，寫入與執行拆開後各自正常
  - 他們拆到兩個 process，測得 eBPF 監控與多數 VirusTotal 引擎沒抓到[^dnc]
  - Windows 版是遠端映射加遠端建執行緒，照本篇分類是==寫入加觸發執行==

兩個操作、位址一致，本篇的偵測條件涵蓋得到。

[^xmg]: C.-C. Wang et al., ["Real-Time Detection of Windows Shellcode Injection via the Cross-Process W^X Principle"](https://doi.org/10.1186/s42400-026-00690-4), _Cybersecurity_, 2026.

[^dnc]: M. Salvatori et al., ["Divide and Conquer: Stealth Code Injection via Split Memory Permission Manipulation Across Processes"](https://ceur-ws.org/Vol-4198/paper30.pdf), in _Proc. ITASEC & SERICS_, 2026, CEUR-WS Vol. 4198. 該文將本篇列為參考文獻 [18].

---
layout: default
---

# 結論

- 過去認不出 Hollowing 的主流寫法
  - 在過去研究的資料上重跑，多量到 ==64.1%== 的注入樣本
- 偵測條件不是新的，但要有 API 層的 telemetry 才寫得出來
  - Elastic 的端點規則早一年公開；Sysmon 沒有配置與寫入的事件，Sigma 與 Splunk 做不到
- 疊在既有監控上只多 ==1.35%== 執行時間
  - 基準是 hook 同一批 API、但不跑分析的 DBI 工具
- 偵測到的 16.5% 是下限
  - 換成不具反規避的工具，同一批樣本僅量到一半
- 注入技術不足以辨識家族
  - 有注入的家族裡，只有 8.1% 的樣本全部都注入

---
layout: default
---

# 延伸問題

1. 最少的節點是多少？能否被推導而非依靠經驗？
2. 偵測條件在論文發表前就公開了，這篇的貢獻該怎麼算？
3. 兩篇的技術組成為什麼差這麼多？誰的野外比較接近真實？

---
layout: references
---

# 參考資料

1. G. Di Pietro, D. C. D'Elia, L. Querzoni, ["Can You Run My Code?"](https://doi.org/10.1145/3708821.3736206), _ASIA CCS_, 2025（本篇）
2. J. Starink et al., ["Understanding and Measuring Inter-process Code Injection in Windows Malware"](https://doi.org/10.1007/978-3-031-64954-7_25), _SecureComm_, 2023
3. D. Korczynski, H. Yin, ["Capturing Malware Propagations with Code Injections and Code-Reuse Attacks"](https://doi.org/10.1145/3133956.3134099), _CCS_, 2017
4. D. C. D'Elia et al., ["On the Dissection of Evasive Malware"](https://doi.org/10.1109/TIFS.2020.2976559), _IEEE TIFS_, 2020（BluePill）
5. C.-C. Wang et al., ["Real-Time Detection of Windows Shellcode Injection via the Cross-Process W^X Principle"](https://doi.org/10.1186/s42400-026-00690-4), _Cybersecurity_, 2026
6. M. Salvatori et al., ["Divide and Conquer"](https://ceur-ws.org/Vol-4198/paper30.pdf), CEUR-WS 4198
7. Elastic, [protections-artifacts](https://github.com/elastic/protections-artifacts)，端點行為規則
8. [SigmaHQ/sigma](https://github.com/SigmaHQ/sigma)、[splunk/security_content](https://github.com/splunk/security_content)
9. MITRE ATT&CK, [Process Injection (T1055)](https://attack.mitre.org/techniques/T1055/)
10. J. Leitch, ["Process Hollowing"](https://new.dc414.org/wp-content/uploads/2011/01/Process-Hollowing.pdf), 2011；[injectAllTheThings](https://github.com/mgeeky/injectAllTheThings)（mirror）
11. 程式碼與資料：[Sap4Sec/process-injection](https://github.com/Sap4Sec/process-injection)（本篇）、[utwente-scs/code-injection-malware](https://github.com/utwente-scs/code-injection-malware)（Starink）

---
layout: statement
---

# Q&A

---
layout: end
---

## Yuto

- <me@yuto0226.dev>
- <https://blog.yuto0226.dev>
