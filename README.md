# 티비오더 (TV Order)

트레이딩뷰(TV)의 얼러트를 웹훅으로 받아서 주문(ORDER)해주는 프로그램 

AWS 클라우드에서 동작합니다.

## 트레이딩뷰 웹훅 포맷
```
POST /order
{
    "passcode": "<pass>",
    "exchange": "upbit",
    "symbol": "BTC/KRW",
    "position":"{{strategy.position_size}}",
    "size": "100%"
}
```
### 설명
- passcode : setting.js 파일에 설정한 비밀번호. 맞지 않으면 주문을 할수 없다.
- exchange : 거래소
- symbol : 코인거래쌍. 예) BTCKRW, BTCUSDT
- position : 거래 방향. 
  - 현물에서 매수 시그널이 나오면 양수로 전달되고, 매도 시그널이 나오면 0으로 전달된다.
  - 선물에서 롱 시그널이 나오면 양수, 숏 시그널이 나오면 음수, 종료 시그널이 나오면 0이다.
- size : 매매할 자산의 양. 전체자산대비 얼마나 매매할 것인지 퍼센트로 설정한다.

## 배포하는 방법
1. AWS 회원가입
2. AWS Lambda 서비스로 이동
3. 소스를 zip으로 압축하여 Lambda에 업로드
4. API Gateway로 API 생성
5. API 배포

또는 개발자의 경우 aws cli 설정한뒤 로컬에서 publish.cmd 를 실행
