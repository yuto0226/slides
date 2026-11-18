# 論文表格與關鍵數字

出處：Di Pietro, D'Elia, Querzoni, _Can You Run My Code?_, ASIA CCS 2025。
以 `pdftotext -raw` 從 ACM PDF（doi 10.1145/3708821.3736206）取出，數字逐欄核對過。

## Table 1：各年注入比例（balanced dataset）

| 年份 | 樣本   | 有注入        |
| ---- | ------ | ------------- |
| 2017 | 5,859  | 1,321 (22.6%) |
| 2018 | 14,650 | 1,800 (12.3%) |
| 2019 | 9,978  | 1,181 (11.8%) |
| 2020 | 5,321  | 567 (10.7%)   |
| 2021 | 5,042  | 553 (11.0%)   |
| 2022 | 8,067  | 2,348 (29.1%) |
| 2023 | 7,423  | 1,544 (20.8%) |
| 總計 | 56,340 | 9,314 (16.5%) |

2017–2021 來自 VirusTotal，2022–2023 來自 Bazaar。2022 的跳升與換資料來源同時發生。

## Table 2：各技術的分布（百分比的分母是該年有注入的樣本）

| 技術                          | 2017        | 2018        | 2019        | 2020        | 2021        | 2022          | 2023          | 總計              |
| ----------------------------- | ----------- | ----------- | ----------- | ----------- | ----------- | ------------- | ------------- | ----------------- |
| Shellcode Injection           | 74 (5.6%)   | 453 (25.2%) | 200 (17.0%) | 75 (13.2%)  | 61 (11.0%)  | 25 (1.1%)     | 5 (0.3%)      | 893 (9.6%)        |
| PE Injection                  | 61 (4.6%)   | 357 (19.8%) | 246 (20.8%) | 191 (33.7%) | 47 (8.5%)   | 172 (7.3%)    | 51 (3.3%)     | 1,125 (12.1%)     |
| DLL Injection from Disk       | 3 (0.2%)    | 3 (0.2%)    | 18 (1.5%)   | 0 (0.0%)    | 3 (0.5%)    | 5 (0.2%)      | 1 (0.1%)      | 33 (0.4%)         |
| APC Injection                 | 0 (0.0%)    | 1 (0.1%)    | 0 (0.0%)    | 4 (0.7%)    | 1 (0.2%)    | 0 (0.0%)      | 1 (0.1%)      | 7 (0.1%)          |
| **Process Hollowing**         | 919 (69.6%) | 880 (48.9%) | 414 (35.1%) | 148 (26.1%) | 152 (27.5%) | 2,104 (89.6%) | 1,482 (96.0%) | **6,099 (65.5%)** |
| Thread Execution Hijacking    | 9 (0.7%)    | 41 (2.3%)   | 10 (0.9%)   | 3 (0.5%)    | 58 (10.5%)  | 2 (0.1%)      | 0 (0.0%)      | 123 (1.3%)        |
| Early Bird                    | 161 (12.2%) | 0 (0.0%)    | 1 (0.1%)    | 0 (0.0%)    | 1 (0.2%)    | 0 (0.0%)      | 1 (0.1%)      | 164 (1.8%)        |
| Hook Injection                | 77 (5.8%)   | 83 (4.6%)   | 137 (11.6%) | 28 (5.0%)   | 33 (6.0%)   | 19 (0.8%)     | 4 (0.3%)      | 381 (4.1%)        |
| Atom Bombing                  | 0 (0.0%)    | 1 (0.1%)    | 0 (0.0%)    | 0 (0.0%)    | 0 (0.0%)    | 0 (0.0%)      | 0 (0.0%)      | 1 (0.0%)          |
| Extra Window Memory Injection | 0           | 0           | 0           | 0           | 0           | 0             | 0             | 0 (0.0%)          |
| Process Doppelgänging         | 0 (0.0%)    | 1 (0.1%)    | 0 (0.0%)    | 0 (0.0%)    | 0 (0.0%)    | 0 (0.0%)      | 0 (0.0%)      | 1 (0.0%)          |
| Passive Injection             | 35 (2.7%)   | 91 (5.1%)   | 237 (20.1%) | 151 (26.6%) | 224 (40.5%) | 45 (1.9%)     | 9 (0.6%)      | 792 (8.5%)        |

單一年份的百分比不會加總成 100%：一個樣本可以用不只一種技術。

## Table 5/6/7：三個 primitive 的 API 等價類

這是「用效果定義、不綁 API 名字」的實體。

| primitive | API                                                                                                                                                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 分配      | `VirtualAllocEx`、`VirtualAllocExNuma`、`NtAllocateVirtualMemory`                                                                                                                                                                                                       |
| 寫入      | `WriteProcessMemory`、`NtWriteVirtualMemory`、**`NtMapViewOfSection`**、`LoadLibraryA/W`、`LoadLibraryExA/W`、`LdrLoadDll`、`GlobalAddAtomA/W`、`NtAddAtom`                                                                                                             |
| 觸發執行  | `CreateRemoteThread(Ex)`、`NtCreateThreadEx`、`RtlCreateUserThread`、`QueueUserAPC`、`NtQueueApcThread(Ex)`、`SetThreadContext`／`NtSetContextThread`（需搭配 `ResumeThread`／`NtResumeThread`／`NtAlertResumeThread`）、`SetWindowsHookExA/W`、`SetWindowLong(Ptr)A/W` |

`NtMapViewOfSection` 被歸在**寫入**，不是分配。這解釋了 `neurevt` 為什麼是「分配 —、寫入 ✓」：
它用 section mapping 取代 `VirtualAllocEx`，分配那一步在 trace 裡消失，但映射本身被算成寫入。

## Table 10：第二組 goodware（20 個複雜應用，3 個誤判）

瀏覽器 Chrome、Firefox ESR、Internet Explorer；編輯器 Notepad++、ONLYOFFICE、Sublime Text；
媒體 Audacity、IrfanView、VLC、Windows Media Player；Office Excel、OneNote、PowerPoint、Word；
PDF Adobe Reader、PDF-XChange Editor、SumatraPDF；工具 Skype、Zotero、7-Zip。

## Table 11：Wine 測試的開銷

每項 workload 0.95%–2.85%，最高的是 kernel32 atom（8.147 s → 8.379 s）。

## 內文的關鍵數字

- **19.9%**：在偵測到注入的樣本中，只出現三個 primitive 裡的兩個。分母是「有注入行為的樣本」。
- **36.1%**：同一個比例在 Process Hollowing 上；PE Injection 是 29.9%。
- **36.0%**：no-unmap 變體在 2017 年的占比，隔年就超過原始版本。
- **95.6% / 64.1%**：作者把自己的 balancing 方法套到 Starink et al. 的結果上，涵蓋對方資料集的 95.6%，
  量到比對方多 64.1% 的注入樣本。所以 16.5% 對 9.1% 不是兩個各自為政的數字，作者有做對齊。
- **6.2% / 11.8%**：同一批 2019 年樣本，用沒有反規避的 Detours 版本只量到 6.2%，BluePill 版本量到 11.8%。
  論文據此說實際比例可能更高（"several samples likely evaded also BluePill"）。
- **BluePill 不是本篇的工具**：論文寫 "we used BluePill [29], an extensible framework for dynamic analysis
  of possibly evasive malware, implemented atop the DBI of Pin"。[29] 是 D'Elia, Coppa, Palmaro, Cavallaro,
  _On the Dissection of Evasive Malware_, IEEE TIFS, 2020。作者只是在它上面加 hook。
- **Starink 的逐年數字**：2017 8.3%、2018 13.4%、2019 13.6%、2020 5.1%、2021 6.1%。
