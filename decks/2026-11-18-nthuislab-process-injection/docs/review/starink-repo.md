# Starink repo 調查

來源：https://github.com/utwente-scs/code-injection-malware，clone 到 `C:\Users\Yuto\.claude\jobs\591e8737\tmp\vendor\starink`，HEAD 為 a648c7f "Add citations"（repo 只有這一個 commit 可見，depth 1）。只讀檔，沒有執行 repo 內任何程式。

## Q1：repo 有沒有規則定義？

結論：**有**（但是 13 個檔案，不是 17 個）。

路徑：`src/analyzer/src/Main/Analyzer/Behaviors/*.behavior`，共 13 個：apcdll、apcshell、appcertdll、appinitdll、classicdll、comhijack、ctray、ifeo、processhollow、setwindowshookex、shell、shim、threadhijack。
檔內 `behavior "..."` 名稱依序為：APC DLL Injection、APC Shell Injection、AppCert DLL Injection、AppInit DLL Injection、Classic DLL injection、COM Hijack DLL Injection、CTray Injection、Image File Execution Options、Process Hollowing、SetWindowsHookEx DLL Injection、Generic Shell Injection、Application Shim Injection、Thread Hijacking。
repo 內沒有第 14 到 17 條規則的檔案。簡報若寫「17 條規則在 repo 裡」，這個 repo 只能佐證 13 條。

規則語法說明在 `src/analyzer/README.md`：`place ... accepting` 是接受位置，`transition` 綁一個 API 呼叫，`a -> b` 畫邊，`where` 加約束。評估器在 `src/analyzer/src/Main/Analyzer.Core/Model/Evaluation/`，`BehaviorNetMarking.EnumeratePossibleMerges` 對一個 transition 的每個輸入 place 都要求至少有一個 token，否則回傳空，所以 transition 要等全部輸入 place 到齊才觸發。這與簡報前提一致。

### processhollow.behavior（原文）

```
behavior "Process Hollowing" {

    place [p0 p1 p2 p3 p4 p5 p6 p7]
    place p8 accepting

    transition t0 {
        NtCreateUserProcess(processHandle, threadHandle, _, _, _, _, _, _, _, _, _)
    }

    transition t1 {
        NtUnmapViewOfSection(processHandle, _)
    }

    transition t2 {
        NtAllocateVirtualMemory(processHandle, baseAddress, _, size, _, _)
    }

    transition t3 {
        NtWriteVirtualMemory(processHandle, address, _, _, _)
        where
            address in [baseAddress..(baseAddress+size)]
    }

    transition t4 {
        NtGetContextThread(threadHandle, _)
    }

    transition t5 {
        NtSetContextThread(threadHandle, _)
    }

    transition t6 {
        NtResumeThread(threadHandle, _)
    }

    t0 -> p0 -> t1 -> p1 -> t5
    t0 -> p2 -> t2 -> p3 -> t3 -> p4 -> t5
    t0 -> p5 -> t4 -> p6 -> t5
    t5 -> p7 -> t6 -> p8
}
```

### threadhijack.behavior（原文）

```
behavior "Thread Hijacking" {

    place [
        proc_obtained
        thread_opened
        thread_obtained
        context_obtained
        context_updated
        allocated
        written
    ]

    place done accepting

    transition t0 {
        NtOpenProcess(processHandle, _, _, _)
    }

    transition t1 {
        NtOpenThread(threadHandle, _)
    }

    transition t2 {
        NtSuspendThread(threadHandle, _)
    }

    transition t3 {
        NtCreateUserProcess(processHandle, threadHandle, _, _, _, _, _, _, _, _, _)
    }

    transition t4 {
        NtAllocateVirtualMemory(processHandle, baseAddress, _, size, _, _)
    }

    transition t5 {
        NtWriteVirtualMemory(processHandle, address, _, _, _)
        where
            address in [baseAddress..(baseAddress+size)]
    }

    transition t6 {
        NtGetContextThread(threadHandle, _)
    }

    transition t7 {
        NtSetContextThread(threadHandle, _)
    }

    transition t8 {
        NtResumeThread(threadHandle, _)
    }

    t0 -> proc_obtained
    t1 -> thread_opened -> t2 -> thread_obtained
    t3 -> proc_obtained
    t3 -> thread_obtained

    proc_obtained -> t4 -> allocated -> t5 -> written -> t8
    thread_obtained -> t6 -> context_obtained -> t7 -> context_updated -> t8

    t8 -> done
}
```

### 對照結論（依上面原文推出，非 repo 自述）

1. NtUnmapViewOfSection 在 Process Hollowing 是必要節點。t5 (NtSetContextThread) 的輸入 place 有 p1、p4、p6，p1 只能由 t1 (NtUnmapViewOfSection) 產生。沒有 unmap 事件，t5 不會觸發，後面的 t6 與 accepting 的 p8 都到不了。檔內沒有 NtUnmapViewOfSection 的等價替代（例如 ZwUnmapViewOfSection 或 NtFreeVirtualMemory 的分支）。
2. Thread Hijacking 沒有要求「暫停既有執行緒」。NtSuspendThread (t2) 只在「NtOpenThread -> t1 -> thread_opened -> t2 -> thread_obtained」這條路上。另一條路 t3 (NtCreateUserProcess) 同時輸出 proc_obtained 與 thread_obtained，能繞過 NtOpenProcess、NtOpenThread、NtSuspendThread。所以 Thread Hijacking 圖同時接受「開既有 process 加既有 thread」與「新建 process」兩種來源。依圖，它也能被新建 process 的流程觸發。
   - 注意：proc_obtained 有兩個生產者（t0 或 t3），但 thread_obtained 的生產者是 t2 或 t3。一條只走 t0 加 t1/t2 的路徑和只走 t3 的路徑都能到 done。
3. 兩圖差異的節點：
   - Process Hollowing 多出 NtUnmapViewOfSection（t1）。
   - Process Hollowing 的起點只有 NtCreateUserProcess（t0）；Thread Hijacking 另外接受 NtOpenProcess、NtOpenThread、NtSuspendThread。
   - 其餘 NtAllocateVirtualMemory、NtWriteVirtualMemory（同樣帶 `address in [baseAddress..(baseAddress+size)]`）、NtGetContextThread、NtSetContextThread、NtResumeThread 兩圖都有，且都是必要。
   - 因此 Hollowing 的必要節點集合，加上 NtUnmapViewOfSection，是 Thread Hijacking（新建 process 路徑）的超集。一個有 unmap 的 hollowing 實作會同時命中兩條圖；沒有 unmap 的只命中 Thread Hijacking。這與簡報前提「無法編碼缺席」吻合。
4. 「同時命中就只算 Hollowing」的規則不在 .cs 程式碼裡（對 src 下 .cs 檔 grep hollow/hijack，Internal 以外沒有任何命中）。它在 `src/scripts/calculate_stats.py` 的 `--correct` 旗標：偵測到兩者並存時，從該樣本移除 "Thread Hijacking"。細節見 Q3。

## Q2：有沒有逐樣本分類結果？

結論：**部分**。逐樣本「sample hash 對應偵測到的技術」有，但其中 2,081 筆在 repo 內沒有 hash。

### 技術偵測結果

路徑：`data/reports/{2017..2021}/summaries/*.log`，JSON Lines，一行一個樣本。欄位：`File`（沙箱內路徑）、`Hash`（SHA-256，較新的批次才有）、`DetectedBehaviors`（技術名稱陣列，空陣列代表沒偵測到）、`HasEmptyTrace`（布林，較新的批次才有）。
`data/reports/README.md` 說明同一年有多個檔是因為分批執行，「直接串接即可」。

各檔行數（我用自己寫的腳本，放在 repo 之外，統計）：

| 檔案                                              | 行數   | 備註                                 |
| ------------------------------------------------- | ------ | ------------------------------------ |
| 2017/summary_2017_corrected_full.log_filtered.log | 10,224 | 有 Hash                              |
| 2018/summary_2018_corrected_full.log_filtered.log | 8,191  | 有 Hash                              |
| 2019/summary2019.2.log                            | 1,561  | 無 Hash 欄，檔名即 hash（`xxx.exe`） |
| 2019/summary2019.corrected.log                    | 1,020  | File 是 drakvuf 報告 ID，無 hash     |
| 2019/summary_2019_remaining.log                   | 2,280  | 有 Hash                              |
| 2019/summary_2019_remaining2.log                  | 6,454  | 有 Hash，與 remaining.log 的樣本重疊 |
| 2020/summary2020.2.log                            | 1,481  | 檔名即 hash                          |
| 2020/summary2020.corrected.log                    | 1,061  | File 是 drakvuf 報告 ID，無 hash     |
| 2020/summary_2020_remaining.log                   | 7,155  | 有 Hash                              |
| 2021/summary2021.log                              | 9,999  | 有 Hash                              |
| 2021/summary2021.log_filtered.log                 | 9,997  | 比上一個少 2 行，見 Q4               |

- 去重後可得 hash 的樣本數：45,065（2017 10,224；2018 8,191；2019 8,015；2020 8,636；2021 9,999）。年份之間 hash 沒有重疊。
- 無法得 hash 的：2019.corrected 的 1,020 筆與 2020.corrected 的 1,061 筆，共 2,081 筆。原作者的 `calculate_stats.py` 靠 `drakvuf-logs/<id>/drakrun.log` 裡的 `SHA256:` 行補 hash，但 repo 裡的 `drakvuf-logs` 目錄只有 `.keep`，原始 trace 放在外部 Google Drive（README 連結），我沒有下載。所以這 2,081 筆在 repo 內無法對應 hash。
- 45,065 + 2,081 = 47,146，與論文的 47,128 差 18，原因 repo 沒說明（可能是這 2,081 筆中有與其他檔重複者，我無法驗證）。

### 家族分類（不是技術）

路徑：`data/reports/{year}/samples/classification.txt`，TSV，兩欄 `sha256<TAB>family`（AVClass 標籤，含 `SINGLETON:` 開頭的單例家族）。筆數：2017 19,219；2018 126,318；2019 35,552；2020 38,444；2021 13,971；合計 233,504，18,142 個家族名稱（15,258 個 singleton）。
這是各年「候選樣本池」的家族標籤，比實際執行的 47k 大很多；summaries 的 45,065 個 hash 中有 44,984 個出現在 classification.txt。這個檔案沒有技術欄位。

## Q3：能不能重算 Table 5？

結論：**部分**。Thread Hijack 352 完全對上；Process Hollowing 在 repo 內可得 868，補上無 hash 的 82 筆後剛好 950，但這 82 筆的 hash 無法在 repo 內驗證。

方法：用我自己寫的腳本（放在 `C:\Users\Yuto\.claude\jobs\591e8737\tmp\scripts\recount.py`，用 `python -I` 執行，只讀 data）複製 `src/scripts/calculate_stats.py` 的邏輯：逐行讀 JSON、取 `Hash` 或 `.exe` 檔名、同 hash 的技術集合取聯集；`--correct` 時，若同時有 Process Hollowing 與 Thread Hijacking 就移除 Thread Hijacking。沒有執行 repo 附的任何腳本。

### 重算結果（45,065 個可得 hash 的樣本，其中 4,061 個陽性，9.01%）

| 技術              | 未套用 --correct | 套用 --correct |
| ----------------- | ---------------- | -------------- |
| Thread Hijacking  | 1,112            | **352**        |
| Process Hollowing | 868              | 868            |
| COM Hijack DLL    | 1,127            | 1,127          |
| AppInit DLL       | 893              | 893            |
| Generic Shell     | 629              | 629            |
| IFEO              | 295              | 295            |
| Classic DLL       | 62               | 62             |
| SetWindowsHookEx  | 26               | 26             |
| APC Shell         | 20               | 20             |
| APC DLL           | 2                | 2              |

同時命中 Hollowing 與 Thread Hijacking 的樣本：760。所以 Thread Hijack 從 1,112 降到 352 完全是這條「同時命中就當 Hollowing」的後處理造成的。論文的 352 對得上，且它是校正後的數字。未校正的數字是 1,112，比 Process Hollowing 的 868 還多。

### 無 hash 的 2,081 筆（兩個 corrected 檔）單獨統計（套用 --correct 後）

陽性 222：Process Hollowing 82、COM Hijack 40、AppInit 38、IFEO 32、Generic Shell 24、Classic DLL 19、SetWindowsHookEx 6、APC Shell 1。

### 與論文 Table 5 對照（假設那 2,081 筆與其他檔 hash 不重疊）

| 技術              | 可得 hash 部分 | 加無 hash 部分 | 占 4,278 | 論文         |
| ----------------- | -------------- | -------------- | -------- | ------------ |
| Process Hollowing | 868            | 950            | 22.2%    | 22.2%（950） |
| Thread Hijack     | 352            | 352            | 8.2%     | 8.2%（352）  |
| COM Hijack        | 1,127          | 1,167          | 27.3%    | 27.3%        |
| AppInit DLL       | 893            | 931            | 21.8%    | 21.8%        |
| Generic Shell     | 629            | 653            | 15.3%    | 15.2%        |
| IFEO              | 295            | 327            | 7.6%     | 7.6%         |
| Classic DLL       | 62             | 81             | 1.9%     | 1.9%         |
| WinHook           | 26             | 32             | 0.7%     | 0.8%         |
| APC Shell         | 20             | 21             | 0.5%     | 0.5%         |
| APC DLL           | 2              | 2              | 0.05%    | 0.1%         |

陽性總數：4,061 + 222 = 4,283，論文是 4,278，差 5，我無法解釋（也許少數 hash 在兩個檔重複）。Generic Shell 653/4,278 = 15.26%，論文寫 15.2%。以上百分比我是用 4,278 當分母算的。
CTray、Shim、AppCert 在所有 summary 中都沒有出現，對應論文的 0。
重要限制：這個重算只重現「報表檔的加總」，沒有重新跑沙箱，也沒有重新跑規則，所以驗證的是統計與後處理，不是偵測本身。

## Q4：repo 有沒有論文沒寫的東西？

結論：**有**（以下是我在 repo 內查到的，無法與論文全文逐句比對，因此只列 repo 內的事實）。

- 規則只有 13 個 `.behavior` 檔（Q1），repo 內查不到另外 4 條。
- Thread Hijack 的後處理規則在 `src/scripts/calculate_stats.py` 的 `--correct` 旗標，不在分析器 C# 程式碼裡。分析器本身（`Analyzer`）輸出的是未校正結果，兩條規則會同時命中。檔名帶 `corrected` 的 summary 檔，repo 沒有說明它們與其他批次的差異，我不推測。
- 被排除的樣本：
  - `summary2021.log_filtered.log` 比 `summary2021.log` 少 2 筆，兩筆都是 `Hash` 為 `<unknown>` 且 `HasEmptyTrace: true`（`.../selection/689514c0...exe`、`.../selection/b78a1254...exe`）。
  - `calculate_stats.py` 在找不到 drakvuf 報告或 drakrun.log 沒有 SHA256 時會 `excluded += 1` 並略過該筆。
  - `HasEmptyTrace: true` 的樣本（2019 remaining 40 與 remaining2 152、2020 remaining 96、2021 208）仍然計入分母，沒有被排除。
- `data/ground-truth-samples.zip`（75 個項目，62 個 .exe，我只用 `unzip -l` 列內容，沒有解壓也沒有執行）：按技術分資料夾，含 `ProcessHollowing/`（8 個）與 `ThreadHijack/`（6 個）等。ProcessHollowing 資料夾內有一個檔名 `hollow_MaybeThreadHijack.exe`。repo 內沒有說明這份 ground truth 的預期結果表或準確率數字。
- `src/samples/hbci-implementations/injectors/` 內有 14 個自寫的注入實作（含 `reflectivedllinject`、`shellinject`），`src/drakvuf/hooks.txt` 是沙箱要 hook 的 API 清單（含 NtUnmapViewOfSection、NtSuspendThread、NtGetContextThread 等）。
- README 指向 TOPS '25 擴充論文與 repo：https://github.com/utwente-scs/behavior-net（Behavior Net 的形式化）。這是論文之後的補充，內容我沒有查看。
- Issues 與 PR：`gh issue list` 與 `gh pr list` 對這個 repo 回傳空結果。可見的 git 歷史只有一個 commit（a648c7f "Add citations"，2025-04-09），是 depth 1 的結果，所以更早的歷史我沒看。沒有更正公告或 errata 檔。
