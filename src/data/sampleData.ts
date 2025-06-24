import { Post, Comment } from '@/types';

export const samplePosts: Post[] = [
  {
    id: '1',
    title: '개인회생 신청하려는데 부담스러워요',
    content: '안녕하세요. 현재 3천만원 정도의 부채가 있는데 개인회생을 신청하려고 합니다. 하지만 법원에 가는 게 너무 부담스럽고, 주변 사람들이 알까봐 걱정이 됩니다. 개인회생 신청하신 분들 경험담 좀 들려주세요.',
    nickname: '부담스러운사람',
    category: '개인회생',
    createdAt: '2024-01-15T10:30:00Z',
    viewCount: 156,
    commentCount: 8
  },
  {
    id: '2',
    title: '이혼 후 재산분할 어떻게 해야 할까요?',
    content: '결혼 8년차인데 이혼을 결정했습니다. 집이 하나 있고, 각자 저축도 조금씩 있습니다. 재산분할을 공정하게 하려면 어떻게 해야 할까요? 변호사 선임이 꼭 필요한가요?',
    nickname: '이혼준비중',
    category: '이혼상담',
    createdAt: '2024-01-14T15:45:00Z',
    viewCount: 203,
    commentCount: 12
  },
  {
    id: '3',
    title: '파산 신청 전에 알아야 할 것들',
    content: '사업 실패로 5천만원 정도 빚이 생겼습니다. 파산을 신청하려고 하는데, 파산 신청 전에 미리 준비해야 할 서류나 알아야 할 사항들이 있을까요?',
    nickname: '사업실패자',
    category: '법인파산',
    createdAt: '2024-01-13T09:20:00Z',
    viewCount: 89,
    commentCount: 5
  },
  {
    id: '4',
    title: '개인회생 승인 후 생활이 어려워요',
    content: '개인회생이 승인되어서 다행이지만, 월 상환금이 너무 많아서 생활이 어렵습니다. 상환계획 변경 신청을 할 수 있을까요?',
    nickname: '상환부담',
    category: '개인회생',
    createdAt: '2024-01-12T14:10:00Z',
    viewCount: 134,
    commentCount: 7
  },
  {
    id: '5',
    title: '이혼 후 자녀 양육권 문제',
    content: '초등학교 2학년 아이가 있는데 이혼을 하려고 합니다. 양육권을 어떻게 결정해야 할까요? 아이가 아빠를 더 좋아하는데, 엄마가 양육권을 가지는 게 맞을까요?',
    nickname: '양육고민',
    category: '이혼상담',
    createdAt: '2024-01-11T11:30:00Z',
    viewCount: 267,
    commentCount: 15
  },
  {
    id: '6',
    title: '파산 후 신용회복 기간',
    content: '파산 신청을 하고 싶은데, 파산 후 신용회복이 얼마나 걸릴까요? 신용카드나 대출을 다시 받을 수 있는 기간이 궁금합니다.',
    nickname: '신용회복궁금',
    category: '법인파산',
    createdAt: '2024-01-10T16:20:00Z',
    viewCount: 178,
    commentCount: 9
  },
  {
    id: '7',
    title: '개인회생 vs 파산 어떤 게 나을까요?',
    content: '현재 4천만원 정도의 부채가 있습니다. 개인회생과 파산 중 어떤 방법이 더 좋을지 고민 중입니다. 각각의 장단점을 알려주세요.',
    nickname: '선택고민',
    category: '개인회생',
    createdAt: '2024-01-09T13:45:00Z',
    viewCount: 312,
    commentCount: 18
  },
  {
    id: '8',
    title: '이혼 후 주거 문제 해결 방법',
    content: '이혼 후 집을 나와야 하는데, 월세를 낼 여유가 없습니다. 정부 지원이나 임대주택 같은 혜택을 받을 수 있을까요?',
    nickname: '주거고민',
    category: '이혼상담',
    createdAt: '2024-01-08T10:15:00Z',
    viewCount: 145,
    commentCount: 6
  },
  {
    id: '9',
    title: '파산 신청 후 직장에서 알 수 있나요?',
    content: '파산 신청을 하면 직장에서 알 수 있을까요? 직장을 잃을까봐 걱정이 됩니다. 파산 신청이 공개되는 범위가 궁금합니다.',
    nickname: '직장걱정',
    category: '법인파산',
    createdAt: '2024-01-07T08:30:00Z',
    viewCount: 223,
    commentCount: 11
  },
  {
    id: '10',
    title: '개인회생 상환 완료 후 경험담',
    content: '3년간 개인회생 상환을 완료했습니다! 힘들었지만 이제 자유로워졌어요. 개인회생 중이신 분들 힘내세요. 완료 후 신용회복도 생각보다 빨라요.',
    nickname: '상환완료자',
    category: '개인회생',
    createdAt: '2024-01-06T17:00:00Z',
    viewCount: 445,
    commentCount: 23
  },
  {
    id: '11',
    title: '더미 게시글 11',
    content: '페이징 테스트용 더미 데이터입니다.',
    nickname: '테스터',
    category: '개인회생',
    createdAt: '2024-01-05T12:00:00Z',
    viewCount: 10,
    commentCount: 1
  },
  {
    id: '12',
    title: '더미 게시글 12',
    content: '페이징 테스트용 더미 데이터입니다.',
    nickname: '테스터',
    category: '개인회생',
    createdAt: '2024-01-04T12:00:00Z',
    viewCount: 20,
    commentCount: 2
  },
  {
    id: '13',
    title: '더미 게시글 13',
    content: '페이징 테스트용 더미 데이터입니다.',
    nickname: '테스터',
    category: '개인회생',
    createdAt: '2024-01-03T12:00:00Z',
    viewCount: 30,
    commentCount: 3
  },
  {
    id: '14',
    title: '더미 게시글 14',
    content: '페이징 테스트용 더미 데이터입니다.',
    nickname: '테스터',
    category: '개인회생',
    createdAt: '2024-01-02T12:00:00Z',
    viewCount: 40,
    commentCount: 4
  },
  {
    id: '15',
    title: '더미 게시글 15',
    content: '페이징 테스트용 더미 데이터입니다.',
    nickname: '테스터',
    category: '개인회생',
    createdAt: '2024-01-01T12:00:00Z',
    viewCount: 50,
    commentCount: 5
  },
  {
    id: '16',
    title: '대출 상환 계획 수립 방법',
    content: '현재 여러 은행에서 대출을 받아서 상환이 어려운 상황입니다. 대출 상환 계획을 어떻게 수립해야 할지 조언 부탁드립니다.',
    nickname: '대출고민',
    category: '대출',
    createdAt: '2024-01-16T10:00:00Z',
    viewCount: 89,
    commentCount: 6
  },
  {
    id: '17',
    title: '신용카드 연체 후 신용회복 방법',
    content: '신용카드 연체로 인해 신용점수가 많이 떨어졌습니다. 신용회복을 위한 방법들을 알려주세요.',
    nickname: '신용회복희망',
    category: '신용카드',
    createdAt: '2024-01-17T14:30:00Z',
    viewCount: 156,
    commentCount: 12
  },
  {
    id: '18',
    title: '대출 이자 감면 신청 경험담',
    content: '대출 이자 감면을 신청해서 성공한 경험을 공유합니다. 어떤 서류가 필요한지, 절차는 어떻게 되는지 알려드릴게요.',
    nickname: '이자감면성공',
    category: '대출',
    createdAt: '2024-01-18T09:15:00Z',
    viewCount: 234,
    commentCount: 18
  },
  {
    id: '19',
    title: '신용카드 현금서비스 대출 상환',
    content: '신용카드 현금서비스로 대출을 받았는데 이자가 너무 높아서 상환이 어렵습니다. 다른 대안이 있을까요?',
    nickname: '현금서비스고민',
    category: '신용카드',
    createdAt: '2024-01-19T16:45:00Z',
    viewCount: 178,
    commentCount: 9
  },
  {
    id: '20',
    title: '개인회생 후 신용카드 발급 가능한가요?',
    content: '개인회생 상환 중인데, 신용카드를 발급받을 수 있을까요? 어떤 카드사에서 발급해주는지, 한도는 얼마나 되는지 궁금합니다.',
    nickname: '카드발급희망',
    category: '신용카드',
    createdAt: '2024-01-20T11:20:00Z',
    viewCount: 167,
    commentCount: 8
  },
  {
    id: '21',
    title: '개인회생 신청 절차가 궁금해요',
    content: '개인회생을 신청하려고 하는데, 어떤 절차로 진행되는지 자세히 알려주세요. 서류 준비부터 법원 제출까지 단계별로 설명해주시면 감사하겠습니다.',
    nickname: '절차궁금',
    category: '회생절차',
    createdAt: '2024-01-21T09:30:00Z',
    viewCount: 234,
    commentCount: 15
  },
  {
    id: '22',
    title: '개인회생 상환계획 변경 신청 방법',
    content: '개인회생 상환 중인데 월 상환금이 너무 많아서 생활이 어렵습니다. 상환계획을 변경할 수 있는 방법이 있을까요?',
    nickname: '상환변경희망',
    category: '상환계획',
    createdAt: '2024-01-22T14:15:00Z',
    viewCount: 189,
    commentCount: 12
  },
  {
    id: '23',
    title: '법무사 상담비용이 얼마나 드나요?',
    content: '개인회생 상담을 받으려고 하는데, 법무사 상담비용이 얼마나 드는지 궁금합니다. 무료상담도 가능한가요?',
    nickname: '상담비용궁금',
    category: '법무사상담',
    createdAt: '2024-01-23T16:45:00Z',
    viewCount: 312,
    commentCount: 20
  },
  {
    id: '24',
    title: '개인회생 신청 자격 조건',
    content: '개인회생을 신청하려고 하는데, 어떤 조건을 만족해야 신청할 수 있나요? 부채 금액이나 소득 조건이 있나요?',
    nickname: '자격조건궁금',
    category: '회생절차',
    createdAt: '2024-01-24T11:20:00Z',
    viewCount: 276,
    commentCount: 18
  },
  {
    id: '25',
    title: '개인회생 상환 중 추가 대출 가능한가요?',
    content: '개인회생 상환 중인데, 급한 일이 생겨서 추가 대출이 필요합니다. 상환 중에도 대출을 받을 수 있을까요?',
    nickname: '추가대출희망',
    category: '상환계획',
    createdAt: '2024-01-25T13:30:00Z',
    viewCount: 145,
    commentCount: 9
  },
  {
    id: '26',
    title: '법무사 vs 변호사 어떤 게 좋을까요?',
    content: '개인회생을 도와줄 전문가를 찾고 있는데, 법무사와 변호사 중 어떤 분을 선택하는 게 좋을까요? 차이점이 궁금합니다.',
    nickname: '전문가선택고민',
    category: '법무사상담',
    createdAt: '2024-01-26T10:15:00Z',
    viewCount: 198,
    commentCount: 14
  },
  {
    id: '27',
    title: '개인회생 신청 후 기각된 경우',
    content: '개인회생을 신청했는데 기각되었습니다. 기각 사유와 재신청 가능 여부, 다른 대안이 있는지 알려주세요.',
    nickname: '기각당한사람',
    category: '회생절차',
    createdAt: '2024-01-27T15:40:00Z',
    viewCount: 167,
    commentCount: 11
  },
  {
    id: '28',
    title: '개인회생 상환 중 직장 변경 시',
    content: '개인회생 상환 중인데 직장을 바꾸게 되었습니다. 소득이 변경되면 상환계획에 영향을 주나요?',
    nickname: '직장변경예정',
    category: '상환계획',
    createdAt: '2024-01-28T12:25:00Z',
    viewCount: 134,
    commentCount: 8
  },
  {
    id: '29',
    title: '법무사 상담 시 준비할 서류',
    content: '법무사 상담을 받으려고 하는데, 미리 준비해야 할 서류가 있나요? 어떤 것들을 가져가면 좋을까요?',
    nickname: '서류준비중',
    category: '법무사상담',
    createdAt: '2024-01-29T09:50:00Z',
    viewCount: 223,
    commentCount: 16
  },
  {
    id: '30',
    title: '개인회생 vs 워크아웃 차이점',
    content: '개인회생과 워크아웃의 차이점이 궁금합니다. 어떤 상황에서 어떤 방법을 선택해야 할까요?',
    nickname: '방법선택고민',
    category: '회생절차',
    createdAt: '2024-01-30T14:20:00Z',
    viewCount: 289,
    commentCount: 22
  },
  {
    id: '31',
    title: '파산 후 주택담보대출 받을 수 있나요?',
    content: '파산 신청을 완료했는데, 집이 있어서 주택담보대출을 받고 싶습니다. 가능할까요? 얼마나 기다려야 하는지 알려주세요.',
    nickname: '주택대출희망',
    category: '대출',
    createdAt: '2024-01-21T13:45:00Z',
    viewCount: 189,
    commentCount: 11
  },
  {
    id: '32',
    title: '개인회생 중 신용점수 회복 방법',
    content: '개인회생 중인데 신용점수를 올릴 수 있는 방법이 있을까요? 상환을 잘 하고 있다고 해도 점수가 오르지 않아서 답답합니다.',
    nickname: '신용점수고민',
    category: '개인회생',
    createdAt: '2024-01-22T09:30:00Z',
    viewCount: 312,
    commentCount: 19
  },
  {
    id: '33',
    title: '파산 후 자동차 할부대출 가능한가요?',
    content: '파산을 완료했는데 자동차를 구매하려고 합니다. 할부대출을 받을 수 있을까요? 어떤 조건이 필요한지 알려주세요.',
    nickname: '자동차대출희망',
    category: '대출',
    createdAt: '2024-01-23T15:10:00Z',
    viewCount: 145,
    commentCount: 8
  },
  {
    id: '34',
    title: '신용카드 연체 후 개인회생 신청',
    content: '신용카드 연체가 많아서 개인회생을 신청하려고 합니다. 연체된 카드도 모두 포함되어야 하나요?',
    nickname: '연체고민',
    category: '신용카드',
    createdAt: '2024-01-24T12:00:00Z',
    viewCount: 198,
    commentCount: 13
  },
  {
    id: '35',
    title: '개인회생 후 사업자대출 받은 경험',
    content: '개인회생을 완료하고 작은 사업을 시작하려고 합니다. 사업자대출을 받을 수 있을까요? 경험담 좀 들려주세요.',
    nickname: '사업자대출희망',
    category: '대출',
    createdAt: '2024-01-25T10:15:00Z',
    viewCount: 167,
    commentCount: 10
  },
  {
    id: '36',
    title: '신용카드 한도 상향 조정 신청',
    content: '개인회생 완료 후 신용카드 한도를 올리고 싶습니다. 어떤 절차로 신청해야 하는지 알려주세요.',
    nickname: '한도상향희망',
    category: '신용카드',
    createdAt: '2024-01-26T14:20:00Z',
    viewCount: 123,
    commentCount: 7
  },
  {
    id: '37',
    title: '파산 후 신용정보 삭제 기간',
    content: '파산을 완료했는데 신용정보에서 언제 삭제되는지 궁금합니다. 신용카드나 대출 신청할 때까지 기다려야 하나요?',
    nickname: '신용정보궁금',
    category: '법인파산',
    createdAt: '2024-01-27T16:30:00Z',
    viewCount: 234,
    commentCount: 14
  },
  {
    id: '38',
    title: '개인회생 중 추가 대출 가능한가요?',
    content: '개인회생 상환 중인데 급한 일이 생겨서 추가 대출이 필요합니다. 가능할까요? 어떤 조건이 필요한지 알려주세요.',
    nickname: '추가대출희망',
    category: '대출',
    createdAt: '2024-01-28T11:45:00Z',
    viewCount: 156,
    commentCount: 9
  },
  {
    id: '39',
    title: '신용카드 현금서비스 한도 증가',
    content: '신용카드 현금서비스 한도를 늘리고 싶습니다. 개인회생 완료 후 얼마나 기다려야 하는지 궁금합니다.',
    nickname: '현금서비스한도',
    category: '신용카드',
    createdAt: '2024-01-29T13:20:00Z',
    viewCount: 98,
    commentCount: 6
  },
  {
    id: '40',
    title: '파산 후 신용카드 발급 성공 사례',
    content: '파산 완료 후 2년 만에 신용카드를 발급받았습니다! 어떤 카드사에서 발급받았는지, 절차는 어떻게 됐는지 공유합니다.',
    nickname: '카드발급성공',
    category: '신용카드',
    createdAt: '2024-01-30T09:00:00Z',
    viewCount: 345,
    commentCount: 22
  },
  {
    id: '41',
    title: '개인회생 후 신용정보 조회 방법',
    content: '개인회생 상환 중인데 신용정보를 조회하고 싶습니다. 어디서 조회할 수 있고, 어떤 정보가 나오는지 알려주세요.',
    nickname: '신용정보조회',
    category: '개인회생',
    createdAt: '2024-01-31T14:15:00Z',
    viewCount: 178,
    commentCount: 11
  },
  {
    id: '42',
    title: '파산 후 보험 가입 가능한가요?',
    content: '파산을 완료했는데 생명보험이나 실비보험을 가입하고 싶습니다. 가능할까요? 어떤 보험사에서 가입할 수 있는지 궁금합니다.',
    nickname: '보험가입희망',
    category: '법인파산',
    createdAt: '2024-02-01T10:30:00Z',
    viewCount: 134,
    commentCount: 8
  },
  {
    id: '43',
    title: '신용카드 연체 후 신용회복위원회 상담',
    content: '신용카드 연체가 많아서 신용회복위원회에 상담을 받으려고 합니다. 어떤 절차로 진행되는지 알려주세요.',
    nickname: '신용회복상담',
    category: '신용카드',
    createdAt: '2024-02-02T16:45:00Z',
    viewCount: 223,
    commentCount: 14
  },
  {
    id: '44',
    title: '개인회생 중 월세 계약 가능한가요?',
    content: '개인회생 상환 중인데 이사를 해야 합니다. 월세 계약을 할 수 있을까요? 집주인이 개인회생 사실을 알 수 있나요?',
    nickname: '월세계약고민',
    category: '개인회생',
    createdAt: '2024-02-03T12:20:00Z',
    viewCount: 156,
    commentCount: 9
  },
  {
    id: '45',
    title: '파산 후 신용카드 현금서비스 이용',
    content: '파산 완료 후 신용카드를 발급받았는데, 현금서비스를 이용할 수 있을까요? 한도는 얼마나 되는지 궁금합니다.',
    nickname: '현금서비스이용',
    category: '신용카드',
    createdAt: '2024-02-04T09:10:00Z',
    viewCount: 98,
    commentCount: 6
  },
  {
    id: '46',
    title: '개인회생 후 신용카드 할부 이용',
    content: '개인회생을 완료했는데 신용카드 할부를 이용하고 싶습니다. 가능할까요? 할부 한도는 어떻게 정해지는지 알려주세요.',
    nickname: '할부이용희망',
    category: '신용카드',
    createdAt: '2024-02-05T15:30:00Z',
    viewCount: 145,
    commentCount: 10
  },
  {
    id: '47',
    title: '파산 후 신용카드 포인트 적립',
    content: '파산 완료 후 신용카드를 사용하고 있는데, 포인트 적립이 잘 되는지 궁금합니다. 어떤 카드가 포인트 적립에 유리한가요?',
    nickname: '포인트적립',
    category: '신용카드',
    createdAt: '2024-02-06T11:45:00Z',
    viewCount: 112,
    commentCount: 7
  },
  {
    id: '48',
    title: '개인회생 중 신용카드 해지 후 재발급',
    content: '개인회생 신청 전에 신용카드를 모두 해지했는데, 상환 중에 다시 발급받을 수 있을까요?',
    nickname: '카드재발급희망',
    category: '신용카드',
    createdAt: '2024-02-07T13:20:00Z',
    viewCount: 167,
    commentCount: 11
  },
  {
    id: '49',
    title: '파산 후 신용카드 연회비 면제',
    content: '파산 완료 후 신용카드를 발급받았는데, 연회비 면제 조건이 궁금합니다. 어떤 방법으로 면제받을 수 있나요?',
    nickname: '연회비면제',
    category: '신용카드',
    createdAt: '2024-02-08T10:00:00Z',
    viewCount: 89,
    commentCount: 5
  },
  {
    id: '50',
    title: '개인회생 후 신용카드 해외 이용',
    content: '개인회생을 완료했는데 해외여행을 가려고 합니다. 신용카드 해외 이용이 가능할까요? 어떤 카드가 좋은지 추천해주세요.',
    nickname: '해외이용희망',
    category: '신용카드',
    createdAt: '2024-02-09T16:15:00Z',
    viewCount: 134,
    commentCount: 8
  },
  {
    id: '51',
    title: '신용점수 300점에서 700점으로 올린 경험',
    content: '개인회생 완료 후 신용점수가 300점이었는데, 2년 만에 700점까지 올렸습니다. 어떤 방법으로 점수를 올렸는지 공유합니다.',
    nickname: '신용점수성공',
    category: '신용점수',
    createdAt: '2024-02-10T10:30:00Z',
    viewCount: 456,
    commentCount: 28
  },
  {
    id: '52',
    title: '파산 후 신용점수 회복 기간',
    content: '파산을 완료했는데 신용점수가 언제부터 올라기 시작하는지 궁금합니다. 보통 얼마나 걸리나요?',
    nickname: '신용점수궁금',
    category: '신용점수',
    createdAt: '2024-02-11T14:20:00Z',
    viewCount: 234,
    commentCount: 15
  },
  {
    id: '53',
    title: '신용점수 조회 무료 사이트 추천',
    content: '신용점수를 무료로 조회할 수 있는 사이트가 있을까요? 어떤 사이트가 가장 정확한지 알려주세요.',
    nickname: '무료조회희망',
    category: '신용점수',
    createdAt: '2024-02-12T09:15:00Z',
    viewCount: 189,
    commentCount: 12
  },
  {
    id: '54',
    title: '개인회생 중 신용점수 관리 방법',
    content: '개인회생 상환 중인데 신용점수를 관리할 수 있는 방법이 있을까요? 상환을 잘 하고 있다고 해도 점수가 오르지 않아서 답답합니다.',
    nickname: '점수관리고민',
    category: '신용점수',
    createdAt: '2024-02-13T16:45:00Z',
    viewCount: 312,
    commentCount: 19
  },
  {
    id: '55',
    title: '신용점수 향상을 위한 실천 방법',
    content: '신용점수를 올리기 위해 실천할 수 있는 구체적인 방법들을 알려주세요. 어떤 행동이 점수에 도움이 되는지 궁금합니다.',
    nickname: '점수향상희망',
    category: '신용점수',
    createdAt: '2024-02-14T11:30:00Z',
    viewCount: 278,
    commentCount: 16
  },
  {
    id: '56',
    title: '신용점수 500점대에서 600점대로 올리는 팁',
    content: '신용점수가 500점대에서 600점대로 올리기 어려운데, 어떤 방법으로 올릴 수 있을까요? 경험담 좀 들려주세요.',
    nickname: '600점희망',
    category: '신용점수',
    createdAt: '2024-02-15T13:20:00Z',
    viewCount: 167,
    commentCount: 11
  },
  {
    id: '57',
    title: '신용점수 하락 원인과 대처법',
    content: '신용점수가 갑자기 떨어졌는데, 어떤 원인이 있을 수 있고 어떻게 대처해야 할까요?',
    nickname: '점수하락고민',
    category: '신용점수',
    createdAt: '2024-02-16T15:10:00Z',
    viewCount: 145,
    commentCount: 9
  },
  {
    id: '58',
    title: '신용점수와 대출 한도의 관계',
    content: '신용점수가 얼마나 되어야 대출을 받을 수 있을까요? 점수별로 받을 수 있는 대출 한도가 궁금합니다.',
    nickname: '대출한도궁금',
    category: '신용점수',
    createdAt: '2024-02-17T10:45:00Z',
    viewCount: 198,
    commentCount: 13
  },
  {
    id: '59',
    title: '신용점수 올리는 데 도움이 되는 신용카드',
    content: '신용점수를 올리는 데 도움이 되는 신용카드가 있을까요? 어떤 카드를 사용하면 점수 향상에 유리한지 알려주세요.',
    nickname: '카드추천희망',
    category: '신용점수',
    createdAt: '2024-02-18T12:00:00Z',
    viewCount: 223,
    commentCount: 14
  },
  {
    id: '60',
    title: '신용점수 조회 시 주의사항',
    content: '신용점수를 조회할 때 주의해야 할 점이 있을까요? 너무 자주 조회하면 점수에 영향을 주나요?',
    nickname: '조회주의',
    category: '신용점수',
    createdAt: '2024-02-19T14:30:00Z',
    viewCount: 134,
    commentCount: 8
  },
  {
    id: '61',
    title: '개인회생 후 취업이 어려운가요?',
    content: '개인회생을 신청하려고 하는데, 개인회생 후에 취업이 어려워질까요? 직장에서 개인회생 사실을 알 수 있나요?',
    nickname: '취업걱정',
    category: '취업',
    createdAt: '2024-02-20T09:15:00Z',
    viewCount: 267,
    commentCount: 15
  },
  {
    id: '62',
    title: '파산 후 신용회복 기간 동안 취업 준비',
    content: '파산 신청을 했는데, 신용회복 기간 동안 취업 준비는 어떻게 해야 할까요? 이력서에 파산 사실을 적어야 하나요?',
    nickname: '재기준비',
    category: '취업',
    createdAt: '2024-02-21T11:30:00Z',
    viewCount: 189,
    commentCount: 12
  },
  {
    id: '63',
    title: '개인회생 중에 직장을 구할 수 있을까요?',
    content: '현재 개인회생 상환 중인데, 새로운 직장을 구하려고 합니다. 개인회생 사실이 취업에 영향을 줄까요?',
    nickname: '직장구하기',
    category: '취업',
    createdAt: '2024-02-22T14:45:00Z',
    viewCount: 156,
    commentCount: 9
  },
  {
    id: '64',
    title: '신용불량자도 취업할 수 있는 직종',
    content: '신용불량자인데 취업을 하고 싶습니다. 신용불량자도 취업할 수 있는 직종이나 회사가 있을까요?',
    nickname: '희망찾기',
    category: '취업',
    createdAt: '2024-02-23T16:20:00Z',
    viewCount: 312,
    commentCount: 18
  },
  {
    id: '65',
    title: '개인회생 완료 후 취업 성공 경험담',
    content: '개인회생을 완료하고 새로운 직장에 취업했습니다! 개인회생이 취업에 전혀 영향을 주지 않았어요. 힘내세요!',
    nickname: '성공사례',
    category: '취업',
    createdAt: '2024-02-24T10:00:00Z',
    viewCount: 445,
    commentCount: 23
  },
  {
    id: '66',
    title: '이력서에 개인회생/파산 사실 기재 여부',
    content: '이력서를 작성할 때 개인회생이나 파산 사실을 기재해야 할까요? 기재하지 않아도 되는 건가요?',
    nickname: '이력서고민',
    category: '취업',
    createdAt: '2024-02-25T13:15:00Z',
    viewCount: 223,
    commentCount: 14
  },
  {
    id: '67',
    title: '신용회복 중 자영업 시작하기',
    content: '신용회복 중에 자영업을 시작하려고 합니다. 신용불량자도 사업자등록이나 대출이 가능할까요?',
    nickname: '자영업희망',
    category: '취업',
    createdAt: '2024-02-26T15:30:00Z',
    viewCount: 178,
    commentCount: 11
  },
  {
    id: '68',
    title: '개인회생 후 공무원 시험 응시 가능한가요?',
    content: '개인회생을 완료했는데, 공무원 시험에 응시할 수 있을까요? 개인회생이 공무원 임용에 영향을 주나요?',
    nickname: '공무원희망',
    category: '취업',
    createdAt: '2024-02-27T09:45:00Z',
    viewCount: 334,
    commentCount: 19
  },
  {
    id: '69',
    title: '신용불량자도 가능한 프리랜서 일',
    content: '신용불량자인데 프리랜서로 일하고 싶습니다. 신용불량자도 할 수 있는 프리랜서 일이 있을까요?',
    nickname: '프리랜서희망',
    category: '취업',
    createdAt: '2024-02-28T12:00:00Z',
    viewCount: 201,
    commentCount: 13
  },
  {
    id: '70',
    title: '개인회생 중에 부업으로 할 수 있는 일',
    content: '개인회생 상환 중인데, 부업으로 돈을 벌고 싶습니다. 개인회생 중에도 할 수 있는 부업이 있을까요?',
    nickname: '부업찾기',
    category: '취업',
    createdAt: '2024-02-29T14:20:00Z',
    viewCount: 167,
    commentCount: 10
  }
];

export const sampleComments: Comment[] = [
  {
    id: '1',
    postId: '1',
    content: '저도 개인회생 신청했는데, 처음엔 부담스러웠지만 생각보다 간단했어요. 법원에서 친절하게 안내해주시고, 익명성도 보장됩니다.',
    nickname: '경험자',
    createdAt: '2024-01-15T11:00:00Z',
    parentId: null
  },
  {
    id: '2',
    postId: '1',
    content: '개인회생 신청하실 때는 변호사나 법무사 도움을 받으시는 게 좋아요. 서류 준비가 복잡할 수 있어서요.',
    nickname: '조언자',
    createdAt: '2024-01-15T11:30:00Z',
    parentId: null
  },
  {
    id: '3',
    postId: '2',
    content: '재산분할은 복잡하니까 변호사 선임을 강력히 추천합니다. 나중에 후회하지 않으려면 전문가 도움이 필요해요.',
    nickname: '이혼경험자',
    createdAt: '2024-01-14T16:00:00Z',
    parentId: null
  },
  {
    id: '4',
    postId: '3',
    content: '파산 신청 전에 채권자 목록과 부채 내역을 정확히 정리해두세요. 나중에 서류 준비할 때 도움이 됩니다.',
    nickname: '법인파산준비자',
    createdAt: '2024-01-13T10:00:00Z',
    parentId: null
  },
  {
    id: '5',
    postId: '5',
    content: '아이의 의견도 중요하지만, 양육 능력과 환경을 종합적으로 고려해야 합니다. 전문가 상담을 받아보세요.',
    nickname: '양육상담사',
    createdAt: '2024-01-11T12:00:00Z',
    parentId: null
  },
  {
    id: '6',
    postId: '61',
    content: '개인회생은 공개되지 않기 때문에 직장에서 알 수 없습니다. 안심하고 취업 준비하세요!',
    nickname: '법무사상담',
    createdAt: '2024-02-20T10:00:00Z',
    parentId: null
  },
  {
    id: '7',
    postId: '61',
    content: '저도 개인회생 후에 취업했는데, 전혀 문제없었어요. 오히려 부채가 정리되어서 더 안정적으로 일할 수 있었습니다.',
    nickname: '성공경험자',
    createdAt: '2024-02-20T11:30:00Z',
    parentId: null
  },
  {
    id: '8',
    postId: '64',
    content: '신용불량자도 취업할 수 있는 직종이 많아요. IT, 영업, 서비스업 등이 대표적입니다. 포기하지 마세요!',
    nickname: '취업상담사',
    createdAt: '2024-02-23T17:00:00Z',
    parentId: null
  },
  {
    id: '9',
    postId: '65',
    content: '정말 축하드려요! 개인회생 완료 후 새로운 시작을 하시는 모습이 정말 멋집니다. 저도 힘이 나네요.',
    nickname: '응원하는사람',
    createdAt: '2024-02-24T11:00:00Z',
    parentId: null
  },
  {
    id: '10',
    postId: '68',
    content: '개인회생 완료 후에는 공무원 시험 응시에 제한이 없습니다. 다만 일부 특수한 직종은 제한이 있을 수 있어요.',
    nickname: '공무원준비생',
    createdAt: '2024-02-27T10:30:00Z',
    parentId: null
  }
];

export const sampleAds = [
  {
    id: 'ad1',
    position: 'content',
    code: '<div style="background:#e0f2fe;padding:16px;text-align:center;">[광고] 컨텐츠 영역 광고입니다</div>',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'ad2',
    position: 'sidebar',
    code: '<div style="background:#fef9c3;padding:16px;text-align:center;">[광고] 사이드바 광고입니다</div>',
    isActive: true,
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
  },
  {
    id: 'ad3',
    position: 'bottom',
    code: '<div style="background:#fce7f3;padding:16px;text-align:center;">[광고] 하단 광고입니다</div>',
    isActive: false,
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-03T10:00:00Z',
  },
];

export const sampleNews = [
  {
    id: '1',
    title: '개인회생 신청자 역대 최대…코로나 이후 부채 급증',
    summary: '2024년 상반기 개인회생 신청 건수가 역대 최대치를 기록했다. 전문가들은 코로나19 이후 가계부채 증가와 금리 인상 영향이 크다고 분석한다.',
    source: '연합뉴스',
    date: '2024-06-20',
    category: '개인회생',
    url: 'https://www.yna.co.kr/view/AKR20240620000000'
  },
  {
    id: '2',
    title: '파산 대신 개인회생 선택하는 이유는?',
    summary: '최근 파산 대신 개인회생을 선택하는 사례가 늘고 있다. 신용회복과 재기의 기회를 얻을 수 있기 때문이라는 분석이다.',
    source: '한국경제',
    date: '2024-06-18',
    category: '개인회생',
    url: 'https://www.hankyung.com/economy/article/2024061800001'
  },
  {
    id: '3',
    title: '법원, 소상공인 회생 절차 간소화 추진',
    summary: '법원이 소상공인과 자영업자를 위한 회생 절차 간소화 방안을 발표했다. 신속한 채무조정과 재기 지원이 핵심.',
    source: '조선일보',
    date: '2024-06-15',
    category: '법인회생',
    url: 'https://www.chosun.com/economy/2024/06/15/0000000000/'
  },
  {
    id: '4',
    title: '개인파산, 2030 청년층 비중 증가',
    summary: '최근 2030 청년층의 개인파산 신청이 증가하고 있다. 취업난과 생활비 부담이 주요 원인으로 지목된다.',
    source: '매일경제',
    date: '2024-06-10',
    category: '개인파산',
    url: 'https://www.mk.co.kr/news/society/2024/06/10000000/'
  },
  {
    id: '5',
    title: '워크아웃 신청 건수 전년 대비 15% 증가',
    summary: '법원 개입 없이 채권자와 협의하는 워크아웃 신청이 증가하고 있다. 신속한 채무조정이 가능해 선호도가 높아지고 있다.',
    source: '경향신문',
    date: '2024-06-08',
    category: '워크아웃',
    url: 'https://www.khan.co.kr/economy/article/2024060800001'
  },
  {
    id: '6',
    title: '법인파산 신청 기업, 중소기업 비중 80%',
    summary: '법인파산 신청 기업 중 중소기업이 80%를 차지한다. 자금난과 매출 감소가 주요 원인으로 분석된다.',
    source: '서울경제',
    date: '2024-06-05',
    category: '법인파산',
    url: 'https://www.sedaily.com/NewsView/2024060500001'
  },
  {
    id: '7',
    title: '개인회생 성공률, 전년 대비 5%p 상승',
    summary: '개인회생 인가율이 전년 대비 5%p 상승했다. 법원의 절차 간소화와 전문가 상담 증가가 영향을 미친 것으로 보인다.',
    source: '이데일리',
    date: '2024-06-02',
    category: '개인회생',
    url: 'https://www.edaily.co.kr/news/read?newsId=2024060200001'
  },
  {
    id: '8',
    title: '신용회복위원회, 워크아웃 상담 무료 확대',
    summary: '신용회복위원회가 워크아웃 상담을 무료로 제공하는 범위를 확대했다. 더 많은 채무자들이 혜택을 받을 수 있게 된다.',
    source: '국민일보',
    date: '2024-05-30',
    category: '워크아웃',
    url: 'https://www.kmib.co.kr/article/view.asp?arcid=2024053000001'
  },
  {
    id: '9',
    title: '신용회복위원회, 2024년 상담 건수 20% 증가',
    summary: '신용회복위원회가 발표한 2024년 상반기 통계에 따르면, 상담 건수가 전년 대비 20% 증가했다. 개인부채 증가 영향으로 분석된다.',
    source: '한국일보',
    date: '2024-05-25',
    category: '신용회복위원회',
    url: 'https://www.hankookilbo.com/News/Read/2024052500001'
  },
  {
    id: '10',
    title: '신용회복위원회, 온라인 상담 서비스 개편',
    summary: '신용회복위원회가 온라인 상담 서비스를 개편했다. 24시간 접속 가능하고 더욱 편리한 상담이 가능해졌다.',
    source: '동아일보',
    date: '2024-05-20',
    category: '신용회복위원회',
    url: 'https://www.donga.com/news/article/all/2024052000001'
  }
]; 