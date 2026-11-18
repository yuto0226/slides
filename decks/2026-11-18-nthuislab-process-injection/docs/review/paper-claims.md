# Paper claims inventory: Di Pietro et al., ASIA CCS 2025

Source: paper.txt (17 pp.). Page numbers are ACM pages (1600 = first page). Section refs as in paper.

### Abstract

- **[主張]** 現有研究多限於特定技術或缺乏系統性方法，process injection 在學術界探討不足。出處：Abstract。
- **[方法]** 方法以所有 injection 變體共有的基本操作步驟為核心：尋找最小步驟集合的共現，並以記憶體位址同一性（address identity／congruence）關聯。出處：Abstract。
- **[主張]** 作者稱該方法克服既有研究的準確度與 overhead 限制，能以「可承受的 run-time 成本」可靠偵測並細粒度分析 injection。出處：Abstract。
- **[數字]** 56,340 個代表性樣本、2,667 個家族、2017–2023。分母：不適用（資料集規模）。出處：Abstract。
- **[主張]** 作者估計 process injection 是「dominant evasion strategy」，並認為攻擊者持續依防禦機制與社群知識的演進調整其技術選擇與實作變體。出處：Abstract。
- **[主張]** 比較實驗顯示該方法在辨識 injection 活動上優於專用方案與主流 sandbox。出處：Abstract。
- **[主張]** 作者釋出實作、資料集與實驗 log。出處：Abstract, §1 末（GitHub Sap4Sec/process-injection）。

### §1 Introduction (p.1600–1601)

- **[主張]** Process injection 可提升隱蔽性、有時可做 privilege escalation 與繞過 allow-list 政策。出處：§1 第 3 段。
- **[主張]** Process injection 是 fileless attack 的關鍵手段，而 fileless attack 日益普遍、現為主流威脅型態。出處：§1。
- **[主張]** 偵測 injected payload 比偵測獨立樣本更難，理由：(a) 多數技術不留磁碟痕跡，靜態（簽章）偵測無效；(b) 動態分析若沒抓到 payload 開始執行的時刻，之後行為會與受害程序的正常行為混在一起；(c) 事後鑑識（memory forensics）若樣本有 memory wiping 也可能漏掉。出處：§1 第 4 段。
- **[主張]** AV 不能長時間密切監控執行（overhead 風險）；EDR 廠商的高階指引不總是直接適用，且只涵蓋部分技術。出處：§1。
- **[主張]** 學術界對 injection 關注有限，過去多聚焦單一技術／方案 [21,50,51,84]；完整分析直到 2023 年才出現 [80]（Starink）。作者主張需要更深入、系統化的理解。出處：§1。
- **[方法]** 方法結合兩個先前各自單獨使用的直覺：(1) Starink 的記憶體位址 congruence 判準（取代 [51,63] 所用的昂貴 taint tracking）；(2) Klein et al. [50] 的三步驟（在 victim 配置記憶體、寫入 payload、觸發執行）。出處：§1。
- **[方法]** 用 equivalence class 對每個 primitive 建模，以應付實作多樣化。作者稱這解決 Starink 的 behavior graph 需要 API 身分完全吻合、且需辨識非核心操作的限制。出處：§1。
- **[方法]** 主張「三個操作中至少兩個出現即足以判定 injection」，並以實驗檢驗。出處：§1 第 6 段。
- **[主張]** 對攻擊者：必須以未預期方式實作兩個操作，本質上更難；分析者可在學到新實作時更新 class。對防禦者：技術演進時更易辨識變體。出處：§1。
- **[主張]** Novelty：作者發現 Process Hollowing 的一個實作變體現已在野外占主導；Starink 把 Hollowing 認定為最流行，但因嚴格模式而低估其盛行度。出處：§1。
- **[主張]** Novelty：作者稱明確考慮了「先前工作視為正交」的 malware evasion；整合最先進的反規避系統並做 ablation study，顯示使用 injection 的樣本常同時具規避性，因此「修正」先前研究對 injection 盛行率的不完整結論。出處：§1。
- **[數字]** 資料來源 334,885 個樣本：VirusTotal Academic dataset（2017–2021）與 VX Underground Bazaar（2022、2023）；經平衡與近似重複過濾後得 56,340 個。分母：334,885 → 56,340。出處：§1。
- **[數字]** 平均 16.5% 的分析樣本使用至少一種 injection 技術，且近年盛行度較高。分母：56,340（論文此處未再細分）。出處：§1。
- **[主張]** 作者相信攻擊者可能已依防禦機制演進與社群對新興技術的知識調整選擇。出處：§1。
- **[數字]** 比較實驗：主流開源與閉源 sandbox 在作者方法標記的樣本中，漏掉 21.2% 的 injection 活動。分母：論文此處表述為「samples flagged by our approach」（細節見 §5.4/RQ3）。出處：§1。
- **[主張]** 兩項貢獻：(1) 以三個 operational primitive 的（部分）共現加記憶體範圍 congruence 偵測 injection 的方法；(2) 估計 2017–2023 Windows 惡意軟體 injection 盛行度的實驗研究，提供統計與技術演進、攻擊者選擇的洞見。出處：§1。

### §2 Background and Related Works (p.1601–1602)

- **[方法]** Process injection 三步驟 [50]：(1) 在 victim 配置記憶體區域，(2) 寫入 payload，(3) 在 victim 內排程執行。各步驟在不同技術中實作不同，各有 stealth／reliability 取捨。出處：§2 Operation。
- **[主張]** 技術例示：Shellcode injection（配置、寫入、CreateRemoteThread）；DLL injection from Disk（寫入 DLL 路徑，呼叫 API 迫使 victim 載入）；Process Hollowing（建立 suspended process、unmap 原記憶體〔作者指出為可選步驟〕、配置並填入惡意碼、更新 context 作為 entry point 再 resume）；其他變體劫持既有 thread 或用 APC。更多背景見 Appendix A。出處：§2。
- **[主張]** 攻擊面：Windows 的大量 API 與特殊功能（例如 transacted files 對 AV 不透明）造成大量變體，使防禦研究困難。出處：§2。
- **[主張]** MITRE ATT&CK 把 process injection 定義為 12 項技術，含 true injection（victim 為已在執行的 process）與 victim process spawning（樣本自己啟動並濫用 process）。Klein et al. [50] 整理了 true process injection 的完整目錄，依三個 operation primitive 分類。出處：§2。
- **[限制]** 對既有偵測研究的批評（逐項）：
  - **[主張]** Barabosch et al. [21] honeypot：成效取決於樣本是否選中誘餌 process 為 victim（與 network honeypot 同樣問題）；只處理 true injection；漏掉作者在實驗中觀察到的 recursive pattern。出處：§2 Detection。
  - **[主張]** Memory dump 分析 [20]：單一時間點的擷取可能看不出模式、不適合高頻線上監控、成本高；有些技術在事後 dump 中不可偵測；對手可用 memory wiping 加劇問題。出處：§2。
  - **[主張]** Nasereddin et al. [61]：live memory analysis + 平行計算、多個 agent 監看不同 artifact（記憶體保護、PE header、registry、suspended process）、用 ETW 處理 trace；實驗只涵蓋 6 種 injection 技術。出處：§2。
  - **[主張]** Korczynski et al. [51] 與 Arefi et al. [63]（taint analysis，後者在 QEMU 做 whole-system taint）：資訊豐富準確，但效能與記憶體 overhead 大，妨礙實務使用與整合到 AV／sandbox。出處：§2。
  - **[主張]** Starink et al. [80]：以 behavior graph（Petri net）建模，流程依賴 exact schema，作者稱需要較寬事件抽象時損及準確度。估計 17 種 injection 技術的盛行度，分為 active 與 passive；passive 技術不直接與目標 process 互動，主要靠 victim 在啟動時載入（多半竄改特定 registry key）。MITRE 不歸為 injection 而是 Event Triggered Execution。作者把 Hook Injection 也視為 passive（腳註 1：提供 running victim 的 thread ID 給某 API 最終造成 address space 操作）。出處：§2 Detection、腳註 1。
  - **[主張]** Snow et al. [78]：硬體虛擬化輔助的 shellcode 偵測分析框架。出處：§2。
  - **[主張]** [84,85]：以機器學習偵測隱蔽感染向量，含 process injection。出處：§2。
- **[限制]** 現有方案總結缺陷：(1) 依賴昂貴分析（memory dump、taint），仍可能依時機與樣本特性漏掉行為；(2) 分類導向、從已記載實作語法推導的嚴格規則，易漏掉實作變體與新興技術。前者損及實用性且仍有完整性問題，後者易漏變體。出處：§2 Discussion。
- **[主張]** 第三個限制：許多 injection 活動被 evasion 隱藏，上述研究沒有處理規避，導致低估盛行度。研究者也可能忽略家族間甚至同一家族內樣本的實作差異。出處：§2 Discussion。
- **[數字]** 在 2019 年樣本子集、無反規避機制的系統下，至少 47.3% 有做 injection 的樣本未被偵測。分母：2019 年樣本中有做 injection 者（論文未明說該子集樣本數；此處）。出處：§2 Discussion。
- **[數字]** 與 Starink 的比較：兩份來源資料集交集涵蓋其資料集 95.6%；經去重與平衡後映射到作者最終資料集，多辨識出 64.1% 的 injecting 樣本。分母：論文未明說（映射後的 Starink 資料集 injecting 樣本數）。出處：§2 Discussion。

### §3 Analysis Methodology: scope and framing (p.1602)

- **[方法]** 研究 12 種 injection 技術，作者稱具代表性；資料來源為前述文獻、技術部落格、與分析師的交談、以及少部分作者自身經驗。為何這 12 種構成完整集合見 Appendix A。出處：§3 開頭。
- **[主張]** 幾乎所有已知 injection 技術都圍繞記憶體區域操作，分三步：取得區域、填入、排程執行。理解這些 primitive 及其關係，是掌握問題本質並能偵測新技術的關鍵。出處：§3。
- **[主張]** 三步驟模型對 Starink 的 passive injection 只是「部分」適用。作者立場：這些技術（與 MITRE 一致）屬於 malware persistence 領域，只因為用了不尋常的載體來啟動執行才被視為 injection；若放寬第一步「記憶體配置」的定義，仍可辨識。出處：§3 第 2 段。
- **[限制]** 假設 instrumentation framework 可信、對規避 API call logging 的技術有韌性；若搭配正交緩解措施 [3]（防 stolen code 等攻擊）可放寬此假設。出處：§3。
- **[限制]** 範圍僅限 userspace malware；rootkit 與濫用 kernel 漏洞的樣本不在範圍。作者稱撰寫時未知有此類惡意程式使用 process injection。出處：§3。
- **[主張]** 實務優點：部署需求簡單，只需追蹤特定 API 呼叫及參數值；作者相信因簡單、偵測有效、run-time overhead 有限，可能應用於 sandbox 與 AV。出處：§3。

### §3.1 Overview (p.1603)

- **[方法]** 以 API 序列的「功能類別、時間順序、空間（記憶體）關係」辨識 injection 模式。出處：§3.1。
- **[方法]** 為每個 primitive 建 functionally equivalent API class，涵蓋 high-level API 與 Native（Nt）API；例：遠端配置記憶體含 VirtualAllocEx（含其變體）與 NtAllocateVirtualMemory。執行期只需追蹤參數與回傳值，不需 memory dump 或 taint tracking。出處：§3.1。
- **[數字]** 2.0% 的 injecting 樣本做 recursive injection chain（樣本先感染目標 process，該 process 再 inject 另一個 victim）。分母：injecting 樣本。出處：§3.1。
- **[方法]** 因此監控延伸到原 process 產生的執行流及其後代（遞迴）。出處：§3.1。
- **[主張]** 精密的惡意程式可能多層 injection 以分散攻擊，可能為進一步規避偵測與指紋辨識。出處：§3.1。

### §3.2 Main Challenges (p.1603-1605)

- **[方法]** 三大挑戰：辨識有辨識力的特徵、排除 false positive、分析操作間的時間關係。出處：§3.2。
- **[主張]** 實作多樣性：惡意程式作者使用功能等價的不同 API（找監控缺口或阻礙指紋辨識），或把 API 用在非典型用途達到等效（例：atom table、transacted file）。要求三步驟全部出現的策略，會被成功隱藏其中一步的對手規避。出處：§3.2 Distinctive features。
- **[主張]** 步驟可能難以辨識或兩步合一：記憶體配置可能隱式（針對預先配置的記憶體）；配置與寫入可同時（利用 section object 的 code sharing 機制）。出處：§3.2。
- **[方法]** 結論「三步驟中至少兩步出現即足以指示 injection」，依據是分析多種技術並以 goodware 驗證。作者稱此設計不會對所分析技術產生 false negative。出處：§3.2。
- **[數字]** 19.9% 的 injecting 樣本只觀察到三個 primitive 事件中的兩個。分母：偵測到 injection 的樣本。出處：§3.2（亦見 §5.1）。
- **[主張]** 範例（neurevt 家族，Figure 2）：樣本建立 suspended victim、用 NtUnmapViewOfSection unmap，但不做標準配置，而用 NtCreateSection 建 section，NtMapViewOfSection 兩次（本地一次令 section 指向惡意碼、遠端一次映射到 victim 被 unmap 的區域），再 SetThreadContext + ResumeThread。作者把遠端 section mapping 視為 write 操作；整體只有 write 與 execute 兩個 primitive。作者指出以 map view 繞過顯式記憶體配置，部分安全工具可能漏掉。出處：§3.2 Figure 2。
- **[主張]** 作者稱此例在 Process Hollowing 上特別明顯：其表現與先前最先進認知（Starink）不同；對照 VirusTotal behavioral report，連主流 sandbox 在類似案例也難辨識 injection。出處：§3.2。
- **[限制]** 對 Starink 的批評：behavior graph 假定每個技術到達 accepting state 需固定操作集合，在 primitive 較少時效果差；其偵測依賴額外資訊（例如開啟 process／thread handle 的 API），惡意程式可更隱蔽地取得這些資訊，導致分析失敗、false negative。出處：§3.2。
- **[方法]** 技術分類：先用 distinctive API 區分，以 operational pattern 為次要判準解歧義。Hollowing 以建立 suspended victim 分類。API 太一般時，以配置/寫入操作的特徵區分：Shellcode Injection 與 PE Injection 很相似，以 payload 大小（PE 較大）或寫入次數（例如每個 section 一次）區分。出處：§3.2。
- **[方法]** Relevant operations：許多 injection API 也被正當用途使用（除錯、應用程式互通如 atom table、系統監控）及 Windows DLL 內部使用；分析必須丟棄這些無關事件。出處：§3.2。
- **[方法]** 以「congruent memory areas」為原則（承自 Starink）：若在位址範圍 [a, a+n] 配置，惡意碼必須同區間寫入並從該處啟動執行。以 interval lookup 交集；同時過濾非實際 victim 的其他 process 的操作（以 target process 身分區分）；區間分析涵蓋多個 process，可偵測針對不同 victim 的多次 injection。出處：§3.2 Figure 3（sality 範例：0xA123 配置與 0x5c000 寫入無法與其他操作 congruent，屬雜訊）。
- **[主張]** 作者認為相關函式構成有限集合，新策略必然圍繞或可對映到三個核心步驟；只需兩步出現可降低 false negative 風險，減少分析者被「驚喜」的可能。出處：§3.2。
- **[方法]** Temporal correlation：配置通常先於寫入、寫入先於執行；步驟重疊或合併時，以對應的 sub-scheme 驗證。某些技術的額外操作可亂序（例：DLL Injection from Disk 中 LoadLibrary 位址解析可在執行前任何階段發生），以彈性順序約束建模。出處：§3.2 Temporal correlations。

### §3.3 Implementation (p.1605-1606)

- **[方法]** 自動化動態分析系統，兩個模組（Figure 1）：動態分析模組（在受控環境執行樣本、取得 trace）與分析模組（解讀 trace、辨識分類 injection）。出處：§3.3。
- **[方法]** 以 BluePill [29]（建於 Pin DBI [55]）作為 monitoring module，理由：可中和許多已知規避技術，且易客製以攔截 injection 相關 Windows API。出處：§3.3。
- **[數字]** 追蹤 74 個 API（若區分 A/W 版為 101 個）。分母：不適用。額外追蹤 registry、window memory、hook procedure、TxF 相關 API 以辨識具體技術。Appendix B 列出三個 primitive 的 API。出處：§3.3。
- **[方法]** 在 library 與 system call 兩層設 hook，導向自訂程序以擷取參數。以 Pin 的 -follow_execv 把 instrumentation 延伸至子 process 與遠端 thread，覆蓋 process 階層（含既有或新建的被注入 process）。出處：§3.3。
- **[方法]** Internal-call 雜訊過濾（依 [31]）：僅當呼叫源於受分析程式碼且最終回到該程式碼才算 relevant。用 binary interval tree 存放合法 Windows DLL 的 code section 範圍（隨載入／卸載更新）；若 API call 的 return address 落在其中則丟棄。出處：§3.3。
- **[限制]** 過濾 internal call 的殘餘 false negative 風險，兩種情形：(1) 攻擊者把 Windows DLL API 內的 control flow 劫持到惡意碼，作者稱實務上限制很多（需知 victim 的 DLL 版本、其中有漏洞、可能還要繞過 DLL 的 Control Flow Guard）；(2) 攻擊者把 return address 設為 DLL 內回到惡意碼的 gadget，可在 API 呼叫或返回時驗證 return address 合法性來因應。出處：§3.3。
- **[限制]** DBI 在透明度上「遠非完美」，但作者稱它是實作動態分析工具的 sweet spot（細粒度行為分析，且可納入反規避策略）；其他近期研究也用 DBI [19,28]，包括大規模規避研究。出處：§3.3。
- **[方法]** 反規避的必要性：處理規避以降低漏掉「辨識到分析環境即表現良性」的樣本。為估計規避的影響，以 Microsoft Detours [25] 實作同一套分析程序作為 baseline：Detours 輕量可靠，但使用明顯的 trampoline 做 API hook，且不像 BluePill 有針對虛擬環境規避與分析延遲的措施；作為 ablation study 工具。出處：§3.3。
- **[方法]** 分析模組：API 依操作型態分 equivalence class。寫入記憶體的方式例如位元組複製 API、映射 section、寫入 Atom table、要求 Windows 明確載入模組。Appendix B 列 class。出處：§3.3。
- **[方法]** 相關性：以 interval lookup 檢查 congruence；比對 victim process 身分（PID）與被引用物件；驗證三個核心操作是否都落在一致位址，因為部分匹配可能是 false positive（腳註 2：Starink 的 analyzer 對 Process Hollowing 與 Thread Execution Hijacking 只對配置與寫入檢查位址吻合，但除非 entry point 在 thread context 中一致更新，否則 execution 的語意有效性無保證）。出處：§3.3 腳註 2。
- **[方法]** Handle 處理：在 monitoring module 內把 handle 視為不透明實體，查詢並映射到真實物件識別碼；Starink 則嘗試比對 log 中的 handle 值。作者稱此舉消除 handle reuse 等造成的歧義。出處：§3.3。
- **[方法]** 以時間戳比對時序；若找到至少兩個核心步驟的有效序列，再對完整 API trace 做第二次分析，找出某技術的 distinctive API（例：Hollowing 的 suspended process 建立）。出處：§3.3。

### §4.1 Dataset (p.1606-1607)

- **[方法]** 來源：VirusTotal Academic dataset（2017–2021，廠商於 2021 後停止更新，經私下通訊確認）與 VX Underground Bazaar（補足 2022–2023）。VT Academic 是近期學術工作常用。出處：§4.1。
- **[數字]** 初始 334,885 個 PE 執行檔。分母：初始集合。出處：§4.1。
- **[方法]** 篩選：依 VT 首次提交日排序；丟棄被少於 15 個 AV 廠商標為惡意的 Bazaar 樣本（沿用 VT 資料集的標準）；用 vhash（VT 的靜態指紋）去重以取代表性子集（Appendix C 說明語意損失幾乎為零並去除 over-represented 樣本的偏差）；用 AVClass [76] 標家族，限制單一家族在每年所選樣本中不超過 5%。最終 56,340。出處：§4.1。

### §4.2 Analysis Environment (p.1607)

- **[方法]** 5 台 VirtualBox VM，本機伺服器 Intel Xeon E5-2620 v3 @2.40GHz、24 核、64GB RAM；每 VM 2GB RAM、4 vCPU、Windows 7（為了相容不同年份惡意軟體）。出處：§4.2。
- **[方法]** 加入 wear-and-tear 環境痕跡（文件、歷史、已安裝程式）[58]；以網路服務模擬器提供流量而不給真實網路；分析管理器負責 spawn VM、傳樣本給 guest agent、收集報告；每次執行後以 live snapshot 還原。出處：§4.2。
- **[數字]** 前導實驗：測 26,391 個樣本（最終資料集的 46.8%），最長 8 分鐘：首次 injection 嘗試在 1.5 分鐘內出現者占 95.2%；2 分鐘內出現者為除 215 個樣本外全部。分母：26,391（論文未明說 95.2% 的分母是全部樣本或僅 injecting 樣本）。出處：§4.2。
- **[方法]** 與 [52] 的研究一致（多數行為在前兩分鐘觀察到）；選用 4 分鐘執行視窗，以為 DBI overhead 留較大預算。出處：§4.2。

### §5 RQs

- **[方法]** RQ1：最常見的 injection 技術為何？技術資訊的公開是否影響其採用？RQ2：家族與所用技術是否相關？各家族的技術是否隨時間演變？RQ3：方法是否可用於下游安全方案，效能（例如 false positive）如何？出處：§5 開頭。

### §5.1 Adoption of Process Injection Techniques (p.1607-1609)

- **[數字]** 16.5% 的樣本（9,314 個）出現 injection 嘗試。分母：56,340。核對備註：Table 1 與本節文字寫 9,314；全文沒有「9,296」這個數字。出處：§5.1, Table 1。
- **[數字]** Table 1 逐年（樣本數／injection 數／比例）：2017 5,859／1,321／22.6%；2018 14,650／1,800／12.3%；2019 9,978／1,181／11.8%；2020 5,321／567／10.7%；2021 5,042／553／11.0%；2022 8,067／2,348／29.1%；2023 7,423／1,544／20.8%。分母：各年資料集樣本。比例範圍 10.7%–29.1%。出處：§5.1, Table 1。
- **[數字]** 額外 8,241 個 2021 年 Bazaar（balanced）樣本 injection 比例 31.6%，對照 VT 2021 的 11.0%。分母：8,241。腳註 3：不併入全文統計。出處：§5.1 腳註 3。
- **[主張]** 兩個來源差異的解釋（作者「經仔細分析後結論」，並稱「most likely」）：資料集建構方式不同。VT Academic 為某年內不明月數提交且觸發至少 15 個 AV 的子集（每年一或兩份集合）；其中可能含第二階段 payload（本質上不需 injection）、非惡意的可疑檔案、被感染的 installer。Bazaar 為每月由專業人員回報的惡意樣本。兩者都對一般惡意軟體研究有價值。出處：§5.1。
- **[主張]** 2021 Bazaar 樣本一般更「活躍」（顯眼行為，包括 injection）。出處：§5.1。
- **[主張]** 近期縱貫研究 [42,56] 顯示規避行為的盛行度緩升。出處：§5.1。
- **[數字]** Detours vs. BluePill：以 2019 年平衡集合（為與 [42,56] 共有的最近一年），Detours 只有 6.2% 樣本呈現 injecting，BluePill 為 11.8%。分母：2019 年平衡集合。作者結論：規避技術對分析影響顯著，實際 injecting 樣本數可能更高（部分樣本很可能也規避了 BluePill），並確認先前 injection 文獻之限制。出處：§5.1。
- **[數字]** Starink 的結果：2017 8.3%、2018 13.4%、2019 13.6%、2020 5.1%、2021 6.1%。分母：其測試樣本（其唯一資料集為 VT Academic）。出處：§5.1。
- **[主張]** 作者解釋差異的三個因素：(1) Starink 未對 VT Academic 做平衡，家族過度代表；(2) 其系統無反規避機制（作者承認並以 VM introspection 型 sandbox 部分緩解，但仍易受計時攻擊偵測 VM 或拖延分析器）；(3) 作者方法更通用，涵蓋更多 injection 模式，例如占 injecting 樣本相當比例的 Process Hollowing no-unmap 變體。作者傾向認為自己的研究更能捕捉 injection 的多樣面貌。出處：§5.1。
- **[數字]** 套用作者的平衡方法到 Starink 的結果：涵蓋其資料集 95.6%，多量到 64.1% 的 injecting 樣本。分母：論文未明說。出處：§5.1。
- **[數字]** 19.9% 的 injecting 樣本只出現兩個 primitive；個別技術中 Process Hollowing 36.1%、PE Injection 29.9%，作者把這與技術演進趨勢相聯繫。分母：該技術的 injecting 樣本（論文未明說）。出處：§5.1。
- **[數字]** 技術排行（Table 2，Total 欄；分母＝injecting 樣本 9,314，單一樣本可用多技術，加總不為 100%）：Process Hollowing 6,099（65.5%）；PE Injection 1,125（12.1%）；Shellcode Injection 893（9.6%）；Passive Injection 792（8.5%）；Hook Injection 381（4.1%）；Early Bird 164（1.8%）；Thread Execution Hijacking 123（1.3%）；DLL Injection from Disk 33（0.4%）；APC Injection 7（0.1%）；Atom Bombing 1（0.0%）；Process Doppelgänging 1（0.0%）；Extra Window Memory Injection 0（0.0%）。出處：§5.1, Table 2。
- **[數字]** Table 2 逐年（2017/2018/2019/2020/2021/2022/2023；比例分母＝該年 injecting 樣本，即 Table 1 的 Injection 欄）：
  - Shellcode 74(5.6%)/453(25.2%)/200(17.0%)/75(13.2%)/61(11.0%)/25(1.1%)/5(0.3%)
  - PE 61(4.6%)/357(19.8%)/246(20.8%)/191(33.7%)/47(8.5%)/172(7.3%)/51(3.3%)
  - DLL from Disk 3/3/18/0/3/5/1
  - APC 0/1/0/4/1/0/1
  - Process Hollowing 919(69.6%)/880(48.9%)/414(35.1%)/148(26.1%)/152(27.5%)/2,104(89.6%)/1,482(96.0%)
  - Thread Exec Hijacking 9(0.7%)/41(2.3%)/10(0.9%)/3(0.5%)/58(10.5%)/2(0.1%)/0
  - Early Bird 161(12.2%)/0/1/0/1/0/1
  - Hook 77(5.8%)/83(4.6%)/137(11.6%)/28(5.0%)/33(6.0%)/19(0.8%)/4(0.3%)
  - Atom Bombing 僅 2018 一例；Doppelgänging 僅 2018 一例；Extra Window Memory 全 0
  - Passive 35(2.7%)/91(5.1%)/237(20.1%)/151(26.6%)/224(40.5%)/45(1.9%)/9(0.6%)
    出處：Table 2。
- **[主張]** 許多技術在整個研究期間都有出現，暗示其首次出現可能早於研究時間窗；接近資料集末（2023 年 12 月）仍被偵測到的技術可能持續使用，攻擊者會持續用有效方法並淘汰失效者。出處：§5.1 Techniques Distribution。
- **[主張]** 兩個模式：某些技術遠比其他常見；許多技術集中在特定時期。出處：§5.1。
- **[主張]** Process Hollowing 的主導解釋：以相對簡單達成隱蔽，是攻擊者偏好。它在 2017、2022 年超越所有其他技術總和，2023 年更甚。出處：§5.1。
- **[主張]** 技術內部的垂直演進（Process Hollowing）：作者方法揭露先前研究忽略的實作變體。傳統流程 unmap 目標記憶體（技術名稱由來），但攻擊者現在改為直接修改 victim address space：在系統指派的位址配置新區域並寫入惡意碼，原記憶體不動（no-unmap 變體）。該變體在 2016 [1] 與 2022 [22] 的部落格偶有提及。出處：§5.1。
- **[數字]** no-unmap 變體早在 2017 年即占 36.0%（分母：論文未明說，應指當年 Process Hollowing 樣本），隔年已超越傳統版。出處：§5.1。
- **[主張]** 作者詮釋：攻擊者偏好使用 relocation 機制把 payload 放進 Windows 隨機指派的遠端位址，而不是在 hollow 之後要求固定 base address 的配置；relocation 在技術上不難但顯著提高隱蔽性。no-unmap 避免 NtUnmapViewOfSection 之類顯眼 API、留下較少可偵測的記憶體 artifact，使安全方案在檢查已載入 code module 完整性時更難辨識異常。作者據此稱 Hollowing 因多功能與適應性持續產生新變體，使偵測分析複雜化。出處：§5.1。
- **[主張]** PE Injection 的盛行度超過較簡單的 shellcode，反映攻擊者選擇注入較結構化的 payload；作者相信此轉變可能受大量詳述進階 injection 技術的 white paper 影響 [45,62,69]。出處：§5.1。
- **[主張]** 多數技術在特定短期間達到使用高峰，可能由活躍 malware campaign 測試新戰術驅動。出處：§5.1。
- **[數字]** Early Bird：2017 年占 12.0%（文字）／Table 2 為 12.2%（161），之後急遽消失。分母：2017 年 injecting 樣本。文字與 Table 2 數字有出入。出處：§5.1, Table 2。
- **[主張]** Early Bird 的解釋：各來源顯示它在約 2018 年引起關注（部落格 [27,65,73]），推測攻擊者在它新穎且更難偵測時用於較早的 campaign；變得廣為人知後廠商可能開發出 patch，用量下降。出處：§5.1。
- **[主張]** APC Injection 近乎消失的解釋：這是早期技術，利用 victim thread 的 APC，自 2018 年或更早被辨識 [47] 之後廣為人知，AV 容易偵測。出處：§5.1。
- **[主張]** Passive injection（操縱 registry）在 2019–2021 達高峰（Table 2 為 20.1%、26.6%、40.5%）。與 Starink 的發現在時期上吻合，但 Starink 觀察到採用率上升。作者指出該期間與 COVID-19 重合，攻擊與威脅暴增，促使攻擊者探索替代的惡意碼執行方式 [44,57]。出處：§5.1。
- **[主張]** DLL Injection from Disk 較不流行，可能因現代安全系統容易偵測；但惡意 DLL 載入仍可用其他方式完成，如 Reflective DLL injection（作者將其歸入 PE Injection）。Hook Injection 比例低，暗示轉向 fileless 技術以避免會觸發 AV 警報的明顯 artifact。出處：§5.1。
- **[主張]** Atom Bombing 與 Process Doppelgänging 僅 2018 各一次；Extra Window Memory Injection 無案例。作者稱實務者曾發表這些技術的 PoC [24,43,71]，其測試「確認它們可在真實攻擊中被利用，並可用本方法偵測」。出處：§5.1。
- **[數字]** 每個樣本使用的技術數：96.8% 單一技術、3.0% 兩種、其餘 0.2% 最多三種。分母：論文未明說（應為 injecting 樣本）。使用多技術時，作者稱常「多樣化選擇」。出處：§5.1 Frequency of Use。
- **[數字]** 每個樣本的 injection sequence 數：85.2% 一次、5.1% 兩次、1.2% 三次、其餘四次以上，部分失敗案例會對所有執行中的 process 迴圈嘗試。分母：論文未明說（應為 injecting 樣本）。出處：§5.1。
- **[主張]** 作者結論：攻擊者通常偏好單一技術、針對少量 process，以降低系統干擾並提高成功率。出處：§5.1。
- **[主張]** 最常被鎖定的 process 是高信任度或系統常執行者。出處：§5.1 Target Processes。
- **[數字]** Shellcode 與 PE injection：83.2% 的攻擊針對既有 process 而非新建。分母：論文未明說（指這兩種技術的攻擊）。最常見目標：svchost.exe 48.3%、explorer.exe 33.2%（分母：論文未明說）；notepad.exe 等較少。樣本自行啟動 victim 時無特別偏好。出處：§5.1。
- **[數字]** Process Hollowing 目標：28.6% 為原生（native）process，包含 svchost.exe、taskhost.exe（背景執行；svchost 多個實例）。分母：論文未明說（應為 Hollowing 案例）。出處：§5.1。
- **[數字]** Process Hollowing：45.3% 的案例樣本把自己的複本以 suspended 狀態產生，僅用於 injection。分母：論文未明說（應為 Hollowing 案例）。出處：§5.1。
- **[主張]** 作者與一位資深惡意軟體分析師討論後的「合理解釋」：這是一種 defense evasion。注入的程式碼可躲過 AV／EDR 的程式碼與 run-time 分析（相對於自己直接執行）；寫入自己子 process 的記憶體比寫入無關 victim 容易，因為樣本已持有 handle（而以記憶體寫入權限開啟 process 是顯眼動作）。出處：§5.1。
- **[主張]** RQ1 答案：process injection 是現代惡意軟體的相關現象且高度動態；16.5% 樣本至少用一種技術，Process Hollowing 與 PE Injection 最常見；攻擊者在集中的時期採用技術，可能受社群最新發現影響。出處：§5.1 RQ1 框。

### §5.2 Families and Process Injection Techniques (p.1609-1610)

- **[數字]** 2,667 個家族中，576 個（21.6%）至少有一個樣本採用 injection 技術。分母：2,667 個家族。出處：§5.2。
- **[數字]** 7,219 個樣本（12.8%）AVClass 未分類到任何家族，從家族分析中排除。分母：56,340。出處：§5.2。
- **[數字]** Table 3 前 20 大家族（樣本數／首現年／首次 injection 年／injection 數(比例)／最大技術數）：virlock 1,657／2017／2018／25(1.5%)／2；upatre 1,288／2017／2017／10(0.8%)／1；virut 1,278／2017／2017／84(6.6%)／2；sality 1,203／2017／2017／436(36.2%)／4；vobfus 901／2017／2017／45(5.0%)／1；bladabindi 771／2017／2017／34(4.4%)／2；dealply 757／2017／-／0／0；reline 723／2021／2022／718(99.3%)／1；stop 722／2021／2021／466(64.5%)／1；ramnit 649／2017／2017／329(50.7%)／2；mokes 641／2019／2019／152(23.7%)／1；allaple 603／2017／-／0／0；zard 600／2018／2022／75(12.5%)／1；ursu 570／2017／2017／49(8.6%)／2；sfone 513／2017／-／0／0；gamarue 472／2017／2017／166(35.2%)／3；zbot 471／2017／2017／133(28.2%)／1；tofsee 470／2017／2017／30(6.4%)／1；strab 470／2022／2022／148(31.5%)／1；gandcrab 469／2018／2018／25(5.3%)／2。分母：該家族樣本數。出處：Table 3。
- **[主張]** 家族首現年未必等於開始使用 injection 的年份：virlock、reline、zard 起初未用 injection，後來才採用。出處：§5.2。
- **[主張]** 樣本數較多的家族不是 injection 頻率最高者。reline（竊取使用者帳號資訊）99.3% 樣本用 injection，其次 stop 64.5%。高使用率不一定伴隨技術多樣：ramnit 與 bladabindi 都最多用兩種技術，但 injection 比率差異很大。出處：§5.2。
- **[數字]** Table 4（前述家族逐年技術）：sality 最多樣（SC、PE、PH、HK、P 皆出現）；reline 2021 為 SC,PE,PH、2022 起 PH；stop 2021 PH、2022–2023 PE,PH；strab 2022 PE,PH、2023 PH；gandcrab 單年 SC,PH,TH；ursu 2017 PH,EB、2018 SC,PH,TH；zbot 2017 SC,PE,PH,EB；gamarue 2017 DLL,PE,PH；virlock 含 PE,HK 與 PE,PH；ramnit 含 APC。（文字抽取的欄位對齊不完整，逐格請回 Table 4 核對。）出處：Table 4。
- **[數字]** Usage consistency：在有多個樣本出現 injection 的家族中，只有 39／482（8.1%）家族在所有樣本都一致使用 injection。分母：482 個有多個 injecting 樣本的家族。出處：§5.2。
- **[主張]** 家族內 injection 使用率差異大；一個樣本做 injection 不代表同家族所有樣本都會。作者稱此「似乎與 Starink 的結果相反」。出處：§5.2。
- **[數字]** 跨多年做 injection 的家族中，只有 20.6% 在其出現於資料集的每一年都持續呈現 injection。分母：論文未明說家族數。出處：§5.2。
- **[主張]** 作者認為家族常隨時間因應防禦演進而改變攻擊策略。例：tofsee 資料集最初兩年有 injection，之後一段時間停用，後來再恢復。出處：§5.2, Table 4。
- **[數字]** Selection consistency：僅看 injection 活動跨至少兩年的家族（排除單年家族以減雜訊），138／251（55.0%）家族所有樣本至少有一個一致的技術。分母：251 個跨年 injecting 家族。其餘家族趨勢不同，或在相近技術間轉換（如 PE injection 與 Process Hollowing），或採用完全不同的技術。出處：§5.2。
- **[主張]** 作者認為這也支持其假設：隨防禦演進，家族調整 injection 技術。Table 4 顯示起初用 PE Injection 的家族後來轉用 Process Hollowing；作者推測是因為 Hollowing 隨演進被視為比簡單技術更穩健的變體，特別適合注入整個惡意執行檔。出處：§5.2。
- **[主張]** 與 Starink 一致：僅憑 injection 技術的選擇不足以辨識惡意軟體家族。出處：§5.2。
- **[主張]** RQ2 答案：用 injection 的家族內，很可能同時有用與不用的樣本（在其執行中）；相當數量家族一致使用相同技術，其他則隨趨勢調整；故單靠特定技術選擇不足以準確辨識家族。出處：§5.2 RQ2 框。

### §5.3 Feasibility of Downstream Uses (p.1610-1611)

- **[主張]** 本節目的：評估方法是否可整合進現有方案以更有效對抗惡意技術（與前述縱貫研究的「理解」用途正交）。出處：§5.3。
- **[主張]** False positive：除現代瀏覽器的 process 管理策略（AV 也需辨識並放行）外，goodware 測試顯示 false positive 不太可能；理由是 injection 活動涉及特定的記憶體區域互動，正當軟體不太會以惡意軟體的方式這麼做。作者結論：false positive 不會是下游整合的障礙。細節在 Appendix D（因篇幅）。出處：§5.3。
- **[方法]** 比較 case study：與已有 process injection 機制的封閉與開源工具對比。封閉方案用 VirusTotal Academic API 取得 sandbox 與其他掃描器的 behavioral report。VT 對 2.8% 的樣本沒有行為分析，已排除。出處：§5.3。
- **[數字]** 作者方法偵測到而商用工具未標 injection 的有 2,172 個樣本（24.0%）。分母：論文未明說（由數字反推約 9,050，僅為推算）。出處：§5.3。
- **[數字]** 上述 2,172 個中，29.4% 是靠僅觀察到兩個核心操作（非三個）被作者方法標記。分母：2,172。作者稱這是方法實務價值的強烈指標。出處：§5.3。
- **[方法]** 開源方案：CAPE sandbox [74]（源自 Cuckoo [75]，用 Volatility malfind [41] 外掛偵測 injected code，並有若干反規避機制）。VT 有時依 MITRE ATT&CK 辨識具體技術；CAPE 主要提供執行期記憶體細節。作者稱 malfind 雖有助偵測可疑記憶體區域，仍可能漏掉 injection。出處：§5.3。
- **[數字]** 排除 59 個似乎對 CAPE 太大而無法處理的樣本後，1,694 個（18.3%）作者標記的樣本未被 CAPE 辨識為 injection。分母：論文未明說（應為 9,314 扣 59 後）。其中 13.7% 作者僅看到兩個核心操作。分母：1,694。出處：§5.3。
- **[數字]** 平均 21.2% 的 injecting 樣本在現有工具中成為 false negative（與 24.0% 和 18.3% 的平均吻合，論文未寫算式）。出處：§5.3。
- **[主張]** 作者稱公開 sandbox 與業界看重的工具存在缺口；整合其分析技術到這些系統「會很直接」，因為許多系統已 hook 所需 API 的大部分。出處：§5.3。
- **[建議]** 現有工具與未來研究可考慮把 injection 過程拆解為更小、更細粒度的元件（如作者方法），以協助防禦架構者降低 false negative、改善惡意活動偵測、建立更穩健的惡意軟體分析系統。出處：§5.3。
- **[方法]** Overhead 量測：重現 [31] 的 API call tracing 實驗設定，採最壞情況（call-intensive benchmark）：Wine conformance tests 與 [31] 中 12 個常用 DLL 的 workload（涵蓋 goodware 與惡意程式皆用的大量 API，含 injection 機制所用操作）。比較對象：以相同 hook 但不含呼叫分析程式碼的 baseline DBI 工具（代表會看到相關 API 呼叫但不處理的安全方案；這些 API 對一般惡意碼偵測本就必須追蹤），因此量到的 overhead 僅歸因於偵測 injection 所增加的 instrumentation 邏輯。出處：§5.3。
- **[數字]** 平均 overhead 1.35%（Appendix E）。作者稱支持方法的實用性，且可透過優化實作進一步降低。分母：baseline DBI 工具的執行時間。出處：§5.3。
- **[主張]** RQ3 答案：方法可強化現有惡意軟體分析方案的 injection 偵測，這些方案漏掉了作者測試中辨識出的 21.2% 樣本。出處：§5.3 RQ3 框。
- **[建議]** 社群應優先發展新的、有原則的方法，以更好地理解真實惡意軟體中的 process injection 案例。出處：§5.3 RQ3 框。

### §6 Discussion and Concluding Remarks (p.1611)

- **[主張]** 作者稱：儘管 injection 技術與技術內實作選擇多樣，其方法聚焦於足以偵測 injection 的最小核心操作集合而能加以分析。出處：§6。
- **[主張]** 縱貫結論：process injection 仍是攻擊者繞過防禦的有影響力且受偏好的攻擊向量；觀察到朝向日益演進、強化隱蔽性方法的趨勢。出處：§6。
- **[建議]** 未來偵測方案需捕捉 injection 的基本性質，才能快速適應新發展。出處：§6。
- **[主張]** 結果顯示攻擊者策略可能隨白帽社群的發現而改變。出處：§6。
- **[主張]** 持續流行的原因：已證實有效，儘管已是兩個十年以上的已知問題；技術利用正當操作，廠商封鎖時須謹慎，以免干擾或破壞正常系統功能。作者稱 goodware 實驗顯示其方法不易 false positive，因為只在特定條件（空間與時間 congruence）下才視這些操作與 injection 相關。出處：§6。
- **[限制]** 本研究統計僅能作為 injection 在野盛行度的下界。惡意軟體研究的共同挑戰：沒有理想的完全透明、並能處理惡意軟體其他環境相依性的分析環境，例如 trigger-based 行為（使用者互動）或目標導向（需要 victim 有特定程式或檔案）。出處：§6。
- **[主張]** BluePill 與 Detours 的比較顯示，納入現成反規避措施可暴露明顯更多 injection 活動。方法的優點是簡單，易於整合進其他監控技術。出處：§6。
- **[主張]** 作者稱其發現比先前研究揭露更多活動；因脫離嚴格模式與實作特定規則，可捕捉各技術更多變體。Process Hollowing 為最常見技術，近半數出現屬於先前研究漏掉的 no-unmap 變體，這克服 Starink 方法的一個關鍵限制。出處：§6。
- **[主張]** Novelty claim：作者稱其工作揭示的技術演進與攻擊者明顯選擇的洞見，「在任何先前研究中都不可得」。出處：§6。
- **[主張]** 作者稱其方法有益於改善惡意軟體偵測與分析系統：儘管流行 sandbox 仰賴資源密集的技術偵測並 dump injected payload，仍漏掉作者輕量方法成功偵測的樣本中約五分之一。出處：§6。
- **[主張]** 釋出原始碼、資料集與實驗材料，以刺激後續研究。出處：§6。
- **[主張]** 全文沒有獨立的 Limitations 或 Future work 章節；未來工作的陳述只有「社群應優先發展有原則的方法」與「可優化實作降低 overhead」。出處：全文。

### Appendix A: Representative Process Injection Techniques (p.1613-1614)

- **[方法]** 作者回顧 §2 文獻中的技術與實作，目標是定義「真實世界觀察到」的完整技術集合。出處：App. A。
- **[方法]** 與 Starink 的 17 種技術的關係：為減少冗餘並對齊 MITRE ATT&CK（把 passive 歸入 Event Triggered Execution [4]），把 registry 型 passive 技術合併成一個較廣類別，但保留細粒度區分能力；另外細分 Starink 框架中的某些技術（例：把 PE Injection 與較簡單的 Shellcode Injection 區分）；另外加入 Starink 未涵蓋的技術，如 Early Bird，以及較冷門的 Atom Bombing 與 Process Doppelgänging。出處：App. A。
- **[主張]** 較新的技術（MITRE 與社群認定的 Reflective DLL Injection [67]、ListPlanting [17]）雖引入額外複雜度與推測、超出基本記憶體範圍關聯，仍可歸類於三個核心操作框架；這類進階技術與其他新興方法通常落入 Shellcode 與 PE injection 等更廣類別，作為許多技術的基本案例。作者據此稱其選擇提供理解 process injection 核心概念的完整框架。出處：App. A。
- **[方法]** 12 種技術定義：
  - Shellcode Injection [64]：配置、寫入 shellcode、經新 thread 執行。
  - PE Injection [13]：配置、寫入整個 PE、經新 thread 執行。
  - DLL Injection from Disk [11]：配置、寫入 DLL 路徑、新 thread 呼叫 LoadLibrary；LoadLibrary 語意要求 DLL 存於磁碟。
  - APC Injection [10]：配置、寫入、掛到 victim thread 的 APC queue；目標 thread 必須處於 alertable 狀態。
  - Process Hollowing [15]：建立 suspended victim、（作者發現為「可選」）unmap 原執行碼、以惡意碼取代、resume 後從注入碼 entry point 執行。
  - Thread Execution Hijacking [16]：暫停目標 process 既有 thread、配置、寫入、resume 並讓其執行注入碼。
  - Early Bird [65]：建立 suspended victim、配置、寫入、掛到 victim thread 的 APC queue、resume，thread 進入 alertable 後執行。
  - Hook Injection [68]：在 victim 安裝處理特定 Windows 事件的 hook，註冊的 callback 觸發惡意碼；惡意碼位於樣本先載入自身的 DLL，registered hook 最終使 victim 也載入。
  - Atom Bombing [72]：利用 global atom table 把 payload 寫入目標 process，再掛到 victim thread 的 APC queue 執行。
  - Extra Window Memory Injection [12]：利用視窗類別註冊時配置的 Extra Window Memory 在 victim 內執行。
  - Process Doppelgänging [14,53]：濫用 Transactional NTFS (TxF) [32]，在載入前修改執行檔內容而磁碟上無可見變更。
  - Passive Injection：操縱特定 registry key 迫使其他 process 載入惡意程式庫；含 AppCertDlls [5]、AppInit_Dlls [6]、Application Shimming [7]、Image File Execution Options [9]、COM Hijacking [8]。
    出處：App. A。

### Appendix B: Monitored APIs for the three primitives (p.1614, Tables 5-7)

- **[方法]** 為何這樣分：以三個基本操作（配置、寫入、啟動執行）為 equivalence class 軸，API 依「達成同一語意效果」歸類，涵蓋高階 Win32 API 與 Native Nt API；其他細粒度辨識用 API 見實作。出處：App. B。
- **[方法]** Table 5（記憶體配置）：VirtualAllocEx、VirtualAllocExNuma、NtAllocateVirtualMemory。出處：Table 5。
- **[方法]** Table 6（記憶體寫入）：WriteProcessMemory、NtWriteVirtualMemory；NtMapViewOfSection（把 section view 映射進指定 process）；LoadLibraryA/W、LoadLibraryExA/W、LdrLoadDll（把模組載入呼叫者 address space，Hook Injection 需要）；GlobalAddAtomA/W、NtAddAtom（寫入 global atom table，Atom Bombing）。出處：Table 6。
- **[方法]** Table 7（啟動執行）：CreateRemoteThread、CreateRemoteThreadEx、NtCreateThreadEx、RtlCreateUserThread；QueueUserAPC、NtQueueApcThread、NtQueueApcThreadEx；SetThreadContext／NtSetContextThread 搭配 ResumeThread／NtResumeThread／NtAlertResumeThread；SetWindowsHookExA/W（Hook Injection）；SetWindowLongA/W、SetWindowLongPtrA/W（Extra Window Memory Injection）。出處：Table 7。
- **[主張]** 作者在 Appendix B 沒有對「為何歸為這些類」逐項論述，只列 API 與說明。出處：App. B。

### Appendix C: Representativity of Malware Dataset (p.1614-1615)

- **[方法]** 以 vhash 作為聚類特徵，每群取一個代表樣本，降低冗餘與分布偏差。vhash 即使樣本被修改或混淆仍可快速辨識相似檔案 [36]；演算法專有且無文件，但近期權威研究 [82] 驗證其為良好的聚類特徵。出處：App. C。
- **[數字]** Table 9（vhash 去重前）：初始 334,885；4,549 個沒有 vhash 被排除；剩 330,336；distinct vhash 共 73,922（分母：不含家族平衡）。逐年（Total／無 vhash／有 vhash／distinct vhash）：2017 26,093／575／25,518／6,804；2018 64,355／3,520／60,835／16,611；2019 59,098／315／58,783／11,475；2020 52,512／97／52,415／16,368；2021 25,176／42／25,134／5,625；2022 59,452／0／59,452／8,555；2023 48,199／0／48,199／8,484。出處：Table 9。
- **[方法]** 驗證 vhash 是否使其漏掉 injection 行為：與 Starink 資料集比較（共用 VT 來源，Starink 沒有去重或偏差緩解）。取得其已發布樣本的 vhash 映射到作者集合，重建其資料集 95.6%。出處：App. C。
- **[數字]** 從交集資料集中隨機選 990 個 vhash（injecting 與 non-injecting 各半），對應 14,629 個樣本。出處：App. C。
- **[數字]** Table 8（injecting 的 vhash 群，2017–2021 總計 491 個）：隨機取樣 vhash 數 100/100/100/91/100（2017–2021）；100% injecting 的群 376（76.6%）；超過 80% 樣本 injecting 的群 422（86.0%）；100% 相同 injection 技術的群 480（97.8%）。分母：491。出處：Table 8, App. C。
- **[主張]** 作者結論：同一 vhash 群內 injection 行為高度一致；vhash 對依 injection 行為聚類的初始資料集提供高精確度，簡化對完整 334,885 資料集的評估。出處：App. C。
- **[數字]** 被作者方法分類為 non-injecting 的群中，除兩個 vhash（0.4%）外，non-injecting 行為在所有樣本都獲確認。分母：論文未明說（non-injecting 群數）。出處：App. C。
- **[限制]** 註：Table 8 只涵蓋 2017–2021，沒有 2022–2023。Table 8 的 Total 欄寫 distinct vhash 56,883，與 Table 9 的 73,922 不同（Table 9 含 2022–2023）。出處：Table 8/9。

### Appendix D: Risks of False Positives (p.1615-1616)

- **[方法]** 兩個 goodware 實驗；動機：作者放寬了先前工作（特別是 Starink）嚴格的 pattern matching，因為後者在分析真實惡意軟體時造成許多 false negative。出處：App. D。
- **[數字]** 實驗一（沿用 Starink 方法）：C:\Windows\System32 的 425 個執行檔加上 Chocolatey 提供的 97 個可攜式熱門應用程式；過濾掉被至少一個 VT AV 廠商標為惡意者（移除 55 個具高權限行為的良性程式：除錯、監控與資安工具），剩 467 個。0 個觸發 injection 警報。分母：467。出處：App. D。
- **[主張]** 被移除的除錯／監控／資安工具：進階使用者與管理員預期從可信來源取得；據作者所知 AV 與 EDR 廠商對流行工具有明確放行機制。出處：App. D。
- **[限制]** 作者承認：更複雜的應用程式可能合法地配置可執行記憶體或跨 process 載入物件，存在殘餘風險。出處：App. D。
- **[數字]** 實驗二：Table 10 的 20 個程式（Browsers: Chrome、Firefox ESR、Internet Explorer；Editors: Notepad++、ONLYOFFICE、Sublime Text；Media: Audacity、IrfanView、VLC、Windows Media Player；Microsoft Office: Excel、OneNote、PowerPoint、Word；PDF readers: Adobe Reader、PDF-XChange Editor、SumatraPDF；Utilities: Skype、Zotero、7-Zip）。3 個 false positive：Chrome、Firefox ESR、Skype（Skype 基於 Electron／Chromium）。分母：20。出處：Table 10, App. D。
- **[主張]** False positive 成因：這些程式的多 process 安全架構（渲染引擎與外掛分屬不同 process）會建立自身的 suspended 複本、在目標 process 配置可執行記憶體、寫入、再 resume，與 Process Hollowing 吻合，差別在 resume 時未修改 process context（從原 entry point 繼續）。出處：App. D。
- **[主張]** 作者認為方法「技術上正確」地標出這三個程式（它們如惡意軟體般映射新程式碼），缺的是對 resumption point 合法性的驗證步驟或 allow-list 政策；這類似 AV/EDR 面對可疑程式的處理（先密切監控，累積足夠證據才封鎖）。出處：App. D。
- **[方法]** 目前實作在 ResumeThread 時檢查範圍 congruence：因 resumption point 不在已配置且已寫入的記憶體內，會丟棄 execution primitive，但仍因另兩個 primitive 判為 injection。作者稱可透過加入情境知識矯正。出處：App. D。
- **[主張]** 軼事發現：Microsoft Office（實驗中的 Word）可用 Hook injection 顯示授權啟用彈窗；方法以 wwlib.dll 偵測到 hook injection（idhook=-1，過濾 GUI 活動訊息）。作者強調這不是 false positive，而是合法 Windows 機制的標準使用；只有檢查 DLL 內容與行為才能判斷 DLL 是否惡意（可能內容與來源的完整性檢查就足夠）。出處：App. D。
- **[主張]** 總結：injection 活動涉及特定記憶體互動，多數合法軟體不太會以惡意軟體的方式做；但並非所有程式碼載入皆惡意，程式可能附帶使用被惡意軟體濫用的合法功能。納入像 AV/EDR 的行為與情境感知有望提升偵測準確度，若部署在這類方案中可能成為順帶的能力。出處：App. D。

### Appendix E: Overhead Details (p.1616, Table 11)

- **[方法]** 工作負載依 [31] 選取；Table 11 為各測試負載與執行時間（baseline DBI 工具 vs. injection 偵測）。出處：App. E。
- **[數字]** Table 11（Test／baseline 秒／偵測 秒／overhead；分母：baseline 時間）：kernel32 atom 8.147／8.379／2.85%；advapi32 registry 8.48／8.698／2.57%；user32 edit 14.427／14.645／1.51%；shell32 shellpath 20.415／20.673／1.26%；kernelbase sync 4.383／4.437／1.23%；oleaut32 safearray 5.498／5.563／1.18%；ole32 storage32 33.994／34.391／1.17%；iphlapi default 5.249／5.308／1.12%；ws2_32 protocol 6.804／6.872／1.00%；gdi32 metafile 22.751／22.968／0.95%；crypt32 encode 10.255／10.345／0.88%；wininet internet 20.817／20.923／0.51%。12 項算術平均為 1.35%（與 §5.3 一致）。出處：Table 11。
- **[主張]** 最高 slowdown 出現在 kernel32 與 advapi32 測試，因這些 DLL 較重度使用與 injection 相關的受測 API（特別是配置與寫入），即使基本任務也設計上使用低階 primitive（作者稱一般客戶端使用者程式不太會如此）。出處：App. E。
- **[限制]** Table 11 列出 12 項測試，但正文提到的「Wine conformance tests」本身的個別數字未在 Table 11 單獨列出（表中僅有 12 個 DLL workload）。出處：§5.3, Table 11。
