# 기존 파일 삭제
del index.zip
# 소스 압축
7z a -r index.zip -x!test -x!".idea" -x!".git" *
# 람다 함수 업로드
aws lambda update-function-code --function-name tv-order --zip-file fileb://index.zip
