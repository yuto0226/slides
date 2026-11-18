# 簡報實際內容清單（deck-claims）

來源：slides.md。實際頁數是 25 頁（不是 24）：第 25 頁是 layout: end 的聯絡頁，第 24 頁是 Q&A。頁碼以 frontmatter 為第 1 頁計。
數字標記：「螢幕」＝螢幕上有寫分母；「僅備註」＝只有備註有寫；「無」＝完全沒寫。
備註裡的頁碼引用有一處過時：p7 備註「回扣第 4 頁那條規則」，第 4 頁是「為什麼選 process injection」，規則在 p12。

## p1 封面

重點：打招呼並交代題目是 Windows malware 的 process injection。
數字：

- 2026-11-18（日期）
  主張：
- 今天的題目方向是 Windows malware 的 process injection（備註）。
  視覺：cover layout，標題與副標（日期、Yuto）。

## p2 Can You Run My Code?

重點：交代論文出處，並用三句話說這篇在做什麼。
數字：

- 2017–2023（樣本時間範圍）— 螢幕
- 56,340 個樣本 — 螢幕（即總樣本）
- 2,667 個家族 — 螢幕；備註與全篇之後都沒再提家族
- 論文年份 2025、DOI 10.1145/3708821.3736206
  主張：
- 論文研究野外 injection 怎麼寫、有多普遍。
- 偵測不列舉手法，改以「核心操作」為準。
- 結論留到最後一頁；「繞不過去的操作」p12 才給正式定義（備註）。
  視覺：PaperCard（標題、三位作者、Sapienza University of Rome、ACM ASIA CCS 2025、DOI 連結）加三點條列。

## p3 怎麼繞過偵測？

重點：EDR/AV 偵測分靜態與動態，繞過有三條路，「借用合法 process」最難偵測，也是全場主題。
數字：無。
主張：

- 靜態偵測掃檔案特徵（備註：雜湊與特徵碼），動態偵測看事件與 API 呼叫。
- 加殼、變形：程式碼在記憶體還原，磁碟 bytes 每次不同。備註：靜態拿到密文，但檔案在磁碟，解開前後仍可比。
- 不落地（fileless）：payload 只在記憶體。備註：從網路取得後直接載入，process 自己開，母子關係與呼叫序列仍在動態眼下。
- 借用合法 process：靜態看到合法簽章，動態事件落在基線內。例：LOLBAS。備註：兩邊同時對不上，是三條裡最難偵測的。
- 為何放得過去（僅備註）：每個元件都驗簽章、追呼叫吃效能，所以白名單放寬微軟簽章元件，這是第三條路的誘因。
  視覺：純文字巢狀條列，無圖表。

## p4 為什麼選 process injection？

重點：注入讓惡意行為繼承目標 process 的歸屬、權限與存取，靜態無差異，只剩跨 process 呼叫序列可當依據。
數字：無。
主張：

- 事件歸屬給目標 process（PID 與 image path）。備註：EDR 事件以 PID 為單位。
- 以目標 process 的 access token 執行：使用者、群組、privileges、integrity level 一併取得。備註：不需自己提權。
- 沿用目標已有的存取權：已開 handle、防火牆與應用程式白名單例外。
- 靜態比對沒有差異，只剩跨 process 呼叫序列可依據。
- 備註：注入是把自己搬進對方的 address space；接下來三頁各示範一次呼叫序列。
  視覺：純文字條列。

## p5 DLL Injection

重點：寫進去的只是路徑字串，把 DLL 載入記憶體的是目標 process 自己的 loader。
數字：

- 「七種 DLL injection 實作」— 腳註（injectAllTheThings 收錄），無分母概念
  主張：
- 三步：VirtualAllocEx 分配、WriteProcessMemory 寫入路徑字串、CreateRemoteThread 載入。
- 備註：寫入的不是程式碼；整條鏈最像攻擊的一步由合法元件完成。
- 腳註：原 repo 已下架，連結為 mirror。
  視覺：ProcMap 逐 click 動畫（見元件節）。左 malware.exe，右 target.exe；VirtualAllocEx 分配虛線空槽，WriteProcessMemory 寫入 "evil.dll"（危險色虛線），CreateRemoteThread 點亮 LoadLibraryA 並用虛線「當參數」連回字串。三步條列。

## p6 Process Hollowing

重點：process 路徑與命令列合法，只有記憶體內容被換掉。
數字：

- 65.5%（占 injecting 樣本）— 僅備註；備註沒寫 9,314 這個分母（9,314 在 p16 螢幕上）
  主張：
- 三步：清空目標 image、寫入 payload、把執行緒進入點改指過去。
- 備註：本篇主角；第 1 步「清空」等一下會被推翻，野外主流不做這一步（預告 p17）。
- 腳註：流程取自 Leitch 2011，是技術原始出處。
  視覺：ProcMap 逐 click 動畫。CreateProcess(SUSPENDED)（目標才出現）、NtUnmapViewOfSection（槽變「已清空」）、WriteProcessMemory（payload）、SetThreadContext（主執行緒，虛線連回「進入點」）。左側另有 payload 槽。

## p7 Thread Execution Hijacking

重點：借用目標既有執行緒，trace 裡沒有 CreateRemoteThread，但寫入那段仍命中規則。
數字：

- 1.3% 沒出現在 p7，只在 p16 備註（分母為 9,314 個注入樣本）。
  主張：
- 三步：暫停既有執行緒、寫入 shellcode、改指令指標並恢復。
- 備註：連「建立執行緒」都沒有；規則關聯的是位址，不是單一 API 名字，所以寫入段仍命中（備註引用「第 4 頁那條規則」，實為 p12）。
- 備註：最後還有 ResumeThread，圖未畫。
  視覺：ProcMap 逐 click 動畫。SuspendThread（既有執行緒標「暫停中」）、WriteProcessMemory（shellcode）、SetThreadContext（虛線連回「RIP」）。

## p8 三種技術的呼叫鏈

重點：三種技術的呼叫鏈不同，但都含分配、寫入、觸發執行三個核心操作；欄會變，列不會。
數字：無（只有各欄呼叫數：6、8、8，非統計）。
主張：

- 灰色 API 對偵測沒有鑑別力，核心操作無法被取代。
- 備註：同一件事三種叫法；框起來的是三個階段，框外是鋪陳與收尾；「抽掉哪些可以、留下哪些不行」是論文要回答的問題。
- 備註：NtUnmapViewOfSection 為灰，不在論文分配類裡；真正分配是下一行 VirtualAllocEx；這是 neurevt 省掉 unmap 仍命中的前提（p12 用）。
  視覺：ApiSeq 三欄圖。
- DLL：OpenProcess、VirtualAllocEx[分配]、WriteProcessMemory[寫入]、GetProcAddress、CreateRemoteThread[執行]、WaitForSingleObject。
- Hollowing：CreateProcess(SUSPENDED)、GetThreadContext、ReadProcessMemory、NtUnmapViewOfSection、VirtualAllocEx[分配]、WriteProcessMemory[寫入]、SetThreadContext[執行]、ResumeThread。
- Hijacking：OpenProcess、OpenThread、SuspendThread、VirtualAllocEx[分配]、WriteProcessMemory[寫入]、GetThreadContext、SetThreadContext[執行]、ResumeThread。
- 三色框標分配、寫入、執行；非核心 API 灰字。
  註：Hollowing 的 ReadProcessMemory、GetThreadContext 沒解釋。論文把 SetThreadContext 歸為「觸發執行」類，投影片沒給分類依據。

## p9 怎麼寫規則才可以偵測三種技術？

重點：過場問題頁。
數字：無。
主張：

- 提問：怎麼寫規則才可以偵測三種技術？
- 備註：停一拍，接前人作法。
  視覺：statement layout，一句話。

## p10 Behavioral Signature

重點：前人（Starink et al.）一種技術一條 Petri net 規則，必須全部節點到齊才命中，所以覆蓋範圍等於作者列舉過的做法。
數字：

- 17 種已知技術 — 螢幕
- 至少 9.1% 出現注入行為 — 螢幕；資料範圍「2017–2021 的樣本」螢幕有；樣本總數（分母）螢幕與備註都沒寫
  主張：
- Starink et al. 為 17 種技術各寫一條 behavior graph 規則。
- Petri net 轉移要等輸入節點全部到齊，少一步就不成立，這是模型本身的性質。
- 備註：一個已知手法一條，比對行為序列而非位元組；學院叫法是 specification-based detection；問到再講。
- 備註：圖是 DLL Injection 那條；虛線是對上的節點；灰字呼叫規則不問；重點是「全部對上才算命中」。
- 備註：覆蓋範圍等於作者列舉過的做法，是下一頁入口。
  視覺：DEFINITION callout（Petri net）加 RuleMatch 圖。

## p11 不同實作的差異

重點：neurevt 用 NtMapViewOfSection 取代分配與寫入，原規則一個節點都對不上；是同一技術的新長相。
數字：無（5 步與 6 步只是清單長度）。
主張：

- 原始版本：CreateProcess(SUSPENDED)、NtUnmapViewOfSection、VirtualAllocEx、WriteProcessMemory、SetThreadContext。
- neurevt：CreateProcess(SUSPENDED)、NtUnmapViewOfSection、NtCreateSection、NtMapViewOfSection（映射進自己）、NtMapViewOfSection（映射進目標）、SetThreadContext。
- VirtualAllocEx 與 WriteProcessMemory 被替換，規則一個節點都對不上。
- 備註：兩次映射都是惡意程式自己呼叫，系統建立 process 時映 image 那次不算。映射本身把記憶體變出來，所以 trace 沒有 VirtualAllocEx。
- 備註：這頁是前頁反例，也是「任兩個」的伏筆；不是新技術，是同一技術的新長相。
- 備註：兩邊結尾的 ResumeThread 沒列。
  視覺：兩欄對照清單（原始版本／neurevt），兩行 NtMapViewOfSection 高亮。無圖。
  註：沒說 neurevt 是什麼（家族名、樣本數、占比）；全篇沒給 neurevt 的任何數量。

## p12 偵測條件

重點：用效果定義操作，不綁 API 名字，判定依據是目標 process 與位址；放寬到任兩個操作仍要位址一致。
數字：

- 19.9%（注入樣本中只出現兩個操作）— 分母在備註（「偵測到注入的樣本」）；螢幕只寫「注入樣本」，沒寫 9,314
- 36.1%（Process Hollowing 只出現兩個操作）— 分母僅備註（「其中的 Process Hollowing」）
- 29.9%（PE Injection）— 僅備註；螢幕沒有；備註沒明說這是「只出現兩個操作」的比例
  主張：
- operational primitive 用效果定義，不綁 API 名字，判定依據是目標 process 與位址。
- 正常程式同樣會分配與寫入，但不會集中在同一段位址。
- 放寬到任兩個操作，位址一致仍是必要條件。
- 備註：論文 Table 6 把 NtMapViewOfSection 歸在「寫入」而非分配；neurevt 分配步在 trace 消失，映射算寫入，剩兩個動作照樣命中。
- 備註：不會變寬鬆（兩個動作仍須同一範圍、同一目標）；不容易漏（藏一步已難，要同時用意料外方式做掉兩步）。
  視覺：DEFINITION callout 加表格（變體 × 分配／寫入／觸發執行／判定），兩列：原始 ✓✓✓ 命中；neurevt — ✓ ✓ 命中。
  註：「觸發執行」類包含哪些 API，螢幕與備註都沒定義；三類核心操作的完整 API 對應（Table 6）沒給。

## p13 Elastic 的端點規則

重點：業界 Elastic 規則（2024-07）已用位址關聯跨 process 呼叫，是「分配＋寫入」兩段，等同論文放寬後的任兩個操作。
數字：

- 2024-07（規則公開時間）— 螢幕寫「早一年」，備註寫 2024-07
- 60 秒窗口 — 僅備註
- 分配段全文 5 個名字 — 僅備註；螢幕節選 3 個（VirtualAllocEx、MapViewOfFile、VirtualProtectEx）
  主張：
- 規則比對跨 process 呼叫序列，不是檔案內容。
- sequence by 是約束：同一段位址、同一目標 process（備註另加 60 秒窗口）。
- VirtualProtect 不是分配而是改權限，要的是「出現可執行記憶體」的效果，寫法已是 operational primitive。
- 論文是三個操作加一約束；規則是兩個操作加同一約束；差別在論文允許任意兩個，規則只認分配加寫入。
- 備註：照名單字面，neurevt 那種兩次 NtMapViewOfSection 路徑兩段都對不上。
- 備註：論文價值不在判準本身，在量到野外多少樣本在做，結論頁再回來。
  視覺：KQL 程式碼區塊（sequence by 兩段：第一段 cross-process 加三個 API 與 protection 含 X，第二段 WriteProcessMemory）。

## p14 BluePill

重點：選用 BluePill，因為需要位址、內建反規避，且對照 Detours 能多量到近一倍的注入。
數字：

- 2020（BluePill 論文年份）— 螢幕
- 6.2%（Detours）與 11.8%（BluePill）— 螢幕寫「同一批 2019 年樣本」，沒寫該批樣本數
- 備註：論文消融實驗，換成沒反規避的工具少掉快一半（沒精確數字）
  主張：
- BluePill 是 D'Elia et al. 2020 的動態分析框架，建在 Intel Pin 插樁（DBI）。
- 作者多 hook library 與 system call，逐次記下參數、目標 process、位址。
- 沙箱只記 API 名稱，沒有位址。
- BluePill 內建反規避。
- 備註：DBI 是執行期把分析程式碼插進指令流；D'Elia 是本篇第二作者；BluePill 不是為本篇做的。
- 備註：問聽眾「只有 hook 拿不到什麼」，答案是位址，是判準的一半。
- 備註：這個數字決定後面能不能看，侷限頁回來講「仍是下限」。
  視覺：兩欄條列（框架本身／選用理由），無圖。
  註：「沙箱只記 API 名稱」沒指名是哪個沙箱，也沒給比較數字（p21 才有「五分之一」）。

## p15 實驗設定

重點：說明樣本、環境與良性對照的規模與條件。
數字：

- 56,340 個惡意樣本 — 螢幕
- 每個執行 4 分鐘 — 螢幕
- 5 台 VirtualBox VM、Windows 7 — 螢幕
- 522 個 Windows 系統程式、VirusTotal 篩除 55 個 — 螢幕（剩 467 在 p19，p15 沒寫算式）
- 20 個常用程式 — 螢幕
- 12 個常用 DLL — 螢幕
- 95.2% 在 1.5 分鐘內出現第一次注入 — 僅備註；分母沒寫（推測是注入樣本）
  主張：
- 每次執行後還原快照。
- 良性：系統程式（篩除 55）、常用程式 20 個（瀏覽器、Office、媒體播放器）。
- 開銷以 Wine conformance tests 與 12 個常用 DLL 的 workload 量測。
- 備註：4 分鐘是給 DBI 開銷留餘裕；VM 放文件、瀏覽紀錄、已安裝程式與模擬網路服務；掃掉的 55 個是 debugging、monitoring、security 工具；20 個程式清單在論文 Table 10。
  視覺：兩欄條列加底部一行，無圖。
  註：樣本來源（VT／Bazaar）此頁沒提，到 p16 才出現。

## p16 野外的注入比例

重點：16.5% 是七年合併比例，逐年在 10.7% 到 29.1% 擺盪，2022 年跳升與換資料來源同年。
數字：

- 9,314 / 56,340 = 16.5% — 螢幕有分子分母
- 逐年：2017 22.6%、2018 12.3%、2019 11.8%、2020 10.7%、2021 11.0%、2022 29.1%、2023 20.8% — 螢幕；逐年樣本數沒寫
- 9.1%（Starink 對照）— 備註（「對照留到結論」，但 p21 備註又說不要把 9.1% 與 16.5% 並講）
- 技術分布，分母 9,314 個注入樣本，僅備註且「被問到才報」：Process Hollowing 65.5%、PE Injection 12.1%、Shellcode 9.6%、Passive 8.5%、Hook 4.1%、Early Bird 1.8%、Thread Execution Hijacking 1.3%
- 備註指向 docs/paper-tables.md
  主張：
- 16.5% 是七年合併，不是逐年平均；年與年差到三倍，引用要連年份一起講（備註）。
- 2022 年起改用 Bazaar；腳註：2017–2021 取自 VirusTotal，2022–2023 取自 Bazaar（論文 Table 1）。
- 跳升與換資料來源同一年，侷限頁再算帳。
- 備註：Thread Execution Hijacking 占比很低，前面給它一頁是因為最能說明「少做一個動作」。
  視覺：YearBars 柱狀圖，2022 紅柱。
  註：逐年樣本數、逐年家族數沒給；技術占比螢幕上無。

## p17 no-unmap 變體

重點：約一半的 Hollowing 樣本不呼叫 unmap，過去的規則把它視為必要條件。
數字：

- 「約一半」— 螢幕；非精確數字，分母（Hollowing 樣本）沒寫
- 36%（2017 年 Hollowing 樣本不呼叫 unmap）— 僅備註；當年樣本數沒寫
- 「2018 年起超過原始版本」— 僅備註，沒給比例
  主張：
- 約一半 Hollowing 樣本不呼叫 unmap。
- 過去規則將 unmap 視為必要條件，因此認不出這一半（備註：前人規則認的是有 unmap 的版本）。
- 備註：全篇最有說服力的一段，指出前人漏掉什麼。
- 備註：不 unmap 的代價是 payload 落在系統給的位址，要自己 relocation；好處是 trace 沒有顯眼的 unmap，記憶體也少破綻。
  視覺：HollowLayout 圖（見元件節）。
  註：p21 的 64.1% 在此頁沒出現；此頁沒有精確比例。

## p18 注入的對象

重點：既有 process 注入集中在 svchost 與 explorer；Hollowing 近一半注入自己的複本。
數字：

- 83.2%（Shellcode 與 PE injection 注入既有 process）— 螢幕；分母「Shellcode 與 PE injection 樣本」沒寫數量
- svchost.exe 48.3%、explorer.exe 33.2% — 螢幕；分母不明（沒寫，推測為注入既有 process 的樣本）
- 45.3%（Hollowing 注入自己的複本）— 螢幕；分母（Hollowing 樣本）沒寫
- 28.6%（Hollowing 注入系統原生程式）— 螢幕；分母同上
  主張：
- 備註：45.3% 是全篇第二有意思的發現。
- 備註：作者請資深分析師討論，兩個理由：EDR 對 process 自己的程式碼查較嚴，放到別的 process 可躲；寫入子 process 不必呼叫 OpenProcess，那個動作本身顯眼。
- 備註：這解釋下一頁的誤判，Chrome、Skype 做同一件事。
  視覺：兩欄條列，無圖。
  註：Hollowing 剩下 26.1% 去向沒說；其他技術（Hook、Early Bird、Passive）的目標沒說；沒有跨技術比較表。

## p19 誤判

重點：偵測條件不使用白名單，系統程式零誤判，複雜程式 3 個；對照 Elastic 規則靠大量排除清單。
數字：

- 467 個 Windows 系統程式 0 個誤判 — 螢幕（522 減 55 的算式在 p15）
- 20 個複雜程式 3 個（Chrome、Firefox ESR、Skype）— 螢幕
- Elastic 規則 82 行、15 條路徑、44 個 SHA-256 排除清單 — 螢幕；統計自 2026-11 的 main 版本（腳註）
- 1.35%（開銷）— 備註只說「留到結論」
  主張：
- 偵測條件僅依據位址與時間的吻合，不用白名單。
- 備註：82 行裡真正偵測邏輯只有兩段，其餘幾乎是排除已知正常軟體；要維護清單，論文沒有。
- 備註：數字是講者自己數 Elastic 檔案得到，不是論文的。
  視覺：兩點條列加一段對照，無圖。
  註：「時間」吻合只在此頁出現，p12 判準沒提時間。

## p20 侷限性

重點：16.5% 是下限；只看 userspace；複雜程式會誤判；資料來源更換使 2021 年比例從 11.0% 變 31.6%。
數字：

- 16.5% 下限 — 螢幕
- 11.0% → 31.6%（2021 年樣本換 Bazaar）— 螢幕；31.6% 的分母螢幕沒寫，備註寫「另外測的 8,241 個 2021 年 Bazaar 樣本，不計入 56,340」
  主張：
- 下限原因：樣本有 anti-debug、anti-VM、timing 檢查或需特定觸發條件；BluePill 無法滿足所有條件。
- 只看 userspace，走 kernel 的樣本不經過這些 API。
- 複雜程式誤判：Chrome、Firefox ESR、Skype 開 suspended 子 process 再寫入可執行記憶體。
- 資料來源：VirusTotal Academic 2021 後停止更新，2022 起改用 Bazaar。
- 備註：形態上就是 Process Hollowing；作者說缺一個「resume 位置合不合法」的驗證。
- 備註：467 個系統程式零誤判。
- 備註：2017–21 用 VT Academic，2022–23 用 Bazaar。
  視覺：兩層巢狀條列，無圖。
  註：「走 kernel 的樣本」只當侷限，沒有估計占比，也沒討論 kernel-mode injection。

## p21 結論

重點：四點：過去漏掉 Hollowing 主流寫法；業界已先得出同結論；開銷只多 1.35%；16.5% 是下限。
數字：

- 64.1%（在過去研究資料上重跑多量到的注入樣本）— 螢幕；分母（相對前人偵測數）螢幕沒寫；備註：「作者把平衡方法套回前人資料，涵蓋其中 95.6%」
- 95.6% — 僅備註
- 1.35%（執行時間）— 螢幕；基準螢幕有（hook 同批 API 但不跑分析的 DBI 工具）
- 「五分之一」（既有分析方案漏掉）— 螢幕；21.2%（RQ3）僅備註；既有方案是哪一個沒說
- 「一半」（換成不具反規避工具，同批樣本僅量到一半）— 螢幕；無精確數字
- 16.5% — 螢幕
  主張：
- 過去漏掉 Hollowing 主流寫法。
- 業界（Elastic）已先得出同樣偵測結論，本篇貢獻是用於野外量測。
- 疊在既有監控上只多 1.35% 執行時間；論點是那些 hook 本來就得掛，判準只多一層處理。
- 量測是 worst case：Wine conformance tests 加 12 個常用 DLL 的 call-intensive workload（備註）。
- 備註：不要講成「9.1% 變 16.5%」，年份與資料來源不同。
- 備註：Elastic 規則作者只需知道規則響不響，不會量野外多少人做。
- 備註：下限不只因為插樁，Detours 對照是證據。
  視覺：兩層巢狀條列，無圖。

## p22 討論

重點：螢幕只列一個討論題：最少的節點是多少、能否被推導。
數字：無。
主張：

- 螢幕只有第 1 題：最少的節點是多少？能否被推導而非依靠經驗？
- 備註提到「第 2 題」，但螢幕上沒有第 2 題（備註與螢幕不一致）。
- 備註第 2 題內容：Elastic 規則 2024-07 早於這篇發表；講者看法是貢獻在量測（16.5%、no-unmap 是主流）；業界規則靠長串路徑與 SHA256 allowlist 壓誤判，論文 3 個誤判是沒有 allowlist 下量出的，兩邊不同一回事。
  視覺：單一編號條列。

## p23 參考資料

重點：列七筆參考。
數字：頁碼 pp. 1600–1616（論文）、pp. 490–514（Starink）、年份。
主張：

- 本論文、Starink 2023、Leitch 2011、Elastic 規則 2024、injectAllTheThings、MITRE T1055、artifact repo（Sap4Sec/process-injection）。
- MITRE T1055 在 p8 腳註提過（T1055.012），其他頁沒引用。
  視覺：references layout 條列。

## p24 Q&A

重點：結束頁。
數字：無。
主張：無。
視覺：statement layout，Q&A。

## p25 聯絡頁（layout: end）

重點：講者聯絡方式。
數字：無。
主張：無。
視覺：end layout，姓名、email、部落格。
註：這是實際第 25 頁，原任務說共 24 頁。

---

# 元件實際畫出的資訊

## PaperCard

畫出：論文標題、作者、單位、會議加年份、DOI 連結。沒有任何研究內容。

## ProcMap

畫出：左 malware、右 target 兩個 address space 方框，三個固定列位槽；每步畫一條由左指向右的實線箭頭，上面貼 API 名；槽依步驟變化（空虛線＝已分配未寫、危險色虛線＝注入內容、點亮＝被觸發）；另有虛線箭頭「當參數」「進入點」「RIP」顯示資料或控制流指向哪個槽。逐 click 動畫。傳達：跨 process 的 API 序列與其效果。沒有時間軸、數字、頻率。

- p5：evil.dll 字串寫入，CreateRemoteThread 觸發 LoadLibraryA。
- p6：目標建立、unmap 清空、寫 payload、SetThreadContext 指到 payload。
- p7：SuspendThread、寫 shellcode、SetThreadContext 指到 shellcode。

## ApiSeq

畫出：三欄呼叫序列（DLL／Hollowing／Hijacking），三種顏色框標分配、寫入、執行，其餘 API 灰字。傳達：階段位置與呼叫數不同，但每欄都有三階段。沒畫：各 API 對應的論文分類表、頻率。

## RuleMatch

畫出：左邊三個圓（Petri net place）依序連箭頭，代表規則 VirtualAllocEx → WriteProcessMemory → CreateRemoteThread；右邊 6 步 DLL injection trace；對上的 3 個以雙向虛線連線，其餘灰字。傳達：規則要求精確名稱與全部到齊。沒畫：失敗案例（少一步會怎樣），那靠口頭與 p11。

## HollowLayout

畫出：兩個 address space 方框並排。左「原始版本」：僅一個 payload 槽，下註「image 換成 payload」。右「no-unmap」：保留 target.exe image，另有 payload 槽，下註「payload 另外分配並自己 relocation」。中間 NtUnmapViewOfSection 打叉表示未呼叫。傳達：no-unmap 為何需要 relocation。沒畫：比例、年份趨勢。

## YearBars

畫出：2017–2023 七根柱，標百分比與年份，2022 紅柱。柱高以 32% 為上限縮放。傳達：逐年擺盪與 2022 跳升。沒畫：樣本數、資料來源分段標示（只在腳註）、誤差。

---

## 簡報完全沒有提到的主題

以下在全部 25 頁（含備註與腳註）中沒有出現，或只被順帶帶過。

- 家族層級分析：只在 p2 出現「2,667 個家族」一個數字，之後沒有任何家族層級結果，也沒說 neurevt 屬於哪個家族、注入是否集中在少數家族。
- 技術逐年消長：p16 只有整體逐年注入率；各技術占比隨年份的變化只有 p17 備註提到 Hollowing 不 unmap 的「2017 年 36%、2018 年起超過原始版本」。
- 各技術的完整比例排行：螢幕上沒有；只在 p16 備註被問到才報（Process Hollowing 65.5%、PE Injection 12.1%、Shellcode 9.6%、Passive 8.5%、Hook 4.1%、Early Bird 1.8%、Thread Execution Hijacking 1.3%），並指向 docs/paper-tables.md。
- 技術分類體系：PE Injection、Shellcode、Passive、Hook、Early Bird 只在 p16 備註以名字出現，沒有任何定義。
- 注入目標的跨技術比較：p18 只有既有 process injection（Shellcode／PE）與 Hollowing 兩組；Hook、Early Bird、Passive 的目標沒說。
- APC injection：完全沒有，只在備註清單出現「Early Bird」一個名字。
- 其他手法：registry-based injection（AppInit_DLLs 等）、Atom Bombing、process doppelgänging／ghosting、module stomping、reflective DLL、threadless injection 等都沒提。
- persistence 與注入的關係：沒提。
- kernel-mode injection：p20 只說「走 kernel 的樣本不經過這些 API」，當作侷限；沒有討論或估計。
- 注入之後 payload 的行為（C2、勒索、infostealer 等）：沒有。
- 樣本類別（packer、行為類別）：沒有。
- 注入與 anti-analysis 的交叉：只有 p20 概括提 anti-debug、anti-VM、timing。
- 防禦建議與緩解措施（Windows 內建防護、EDR 部署建議等）：沒有。作者對偵測的主張只有「不用白名單、依位址與時間」。
- 作者對社群的呼籲與未來工作：只有 p20 備註一句「還缺 resume 位置合不合法的驗證」；artifact 連結在 p23 但未被介紹；沒有呼籲。
- 研究問題結構（RQ1–RQ3）：只在 p21 備註出現「RQ3 的 21.2%」，沒說 RQ 是什麼。
- 與其他沙箱或工具的量化比較：p14 只有 Detours 6.2% 對 BluePill 11.8%；p21 的「五分之一」沒說比較對象。
- Windows 7 以外的環境與新版 Windows 緩解：只提 Windows 7，沒說為何選它，也沒討論與現行系統的相關性。
- 良性程式誤判案例的細部分析：p20 只講形態像 Hollowing。
- 資料與工具釋出（artifact）內容：只在 p14 腳註與 p23 提連結與 CC BY 4.0，沒說裡面有什麼。
- MITRE 對應：T1055 只在 p8 腳註與 p23 出現，沒有逐技術對應。
- 樣本選擇偏差（VT Academic 提交者偏誤、Bazaar 樣本偏向）：p20 只說停更與換源，沒說偏誤如何影響。
