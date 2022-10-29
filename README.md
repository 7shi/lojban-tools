# lojban-tools

Tools for Lojban

These scripts are run by [Deno](https://deno.land/).

1. convert.ts: convert [finprims](https://www.lojban.org/publications/etymology/finprims) to JSON
2. calc.ts: calculate weights
3. test.ts: confirm finprims's score

Weights used by finprims (calculated by calc.ts and modified manually):

```text
Chinese     0.330
English     0.180
Hindi       0.160
Spanish     0.120
Russian     0.120
Arabic      0.070
-----------------
Total       0.980
```

Explanation in Japanese:

* https://qiita.com/7shi/items/700dc16d9dca40afbe99
