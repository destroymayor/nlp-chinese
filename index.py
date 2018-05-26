# 字串模糊比對
from fuzzywuzzy import fuzz
from fuzzywuzzy import process

print(fuzz.ratio("包裏數量較多可使用多筆查詢嗎", "包裏數量較多可使用多筆查詢嗎"))
