# Korean Fitness App - Mobile Application

건강한 삶을 위한 당신의 파트너 - 한국형 피트니스 추적 애플리케이션

## 🌟 주요 기능

### 💪 운동 기록 및 추적
- **운동 기록**: 세트, 반복수, 무게 등 상세한 운동 데이터 기록
- **운동 프로그램**: 사전 정의된 프로그램 또는 사용자 정의 프로그램 생성
- **실시간 운동**: 타이머와 함께하는 실시간 운동 추적
- **운동 이력**: 과거 운동 기록 및 진행도 확인

### 📊 상세한 분석 및 통계
- **운동 분석**: 주간/월간 운동 패턴 분석
- **근력 진행도**: 운동별 최대 중량 및 볼륨 추적
- **신체 측정**: 체중, 근육량, 체지방률 등 신체 지표 관리
- **진행 사진**: 시각적 변화 추적을 위한 진행 사진 관리

### 👥 소셜 기능
- **친구 시스템**: 친구 추가 및 운동 기록 공유
- **피드**: 친구들의 운동 활동 및 성과 확인
- **챌린지**: 다양한 운동 챌린지 참여
- **업적 시스템**: 운동 목표 달성 시 업적 획득

### ⚙️ 개인화 설정
- **알림 관리**: 운동 리마인더, 소셜 알림 등 세부 설정
- **단위 설정**: kg/lbs, cm/ft 등 선호 단위 설정
- **언어 설정**: 다국어 지원 (한국어, 영어, 일본어, 중국어)
- **개인정보 보호**: 프로필 공개 범위 및 데이터 관리

## 🚀 시작하기

### 시스템 요구사항
- **Node.js**: 18.0.0 이상
- **Expo CLI**: 최신 버전
- **React Native**: 0.79.5
- **TypeScript**: 5.8.3

### 설치 방법

1. **저장소 클론**
```bash
git clone <repository-url>
cd mobile
```

2. **의존성 설치**
```bash
npm install
```

3. **개발 서버 실행**
```bash
# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# 웹 브라우저
npm run web

# Expo 개발 서버
npm start
```

### 환경 설정

1. **Expo 계정 설정**
   - [Expo.dev](https://expo.dev)에서 계정 생성
   - `expo login` 명령어로 로그인

2. **푸시 알림 설정**
   - Expo 프로젝트에서 푸시 알림 키 생성
   - `app.json`에서 프로젝트 ID 설정

3. **백엔드 API 연결**
   - `src/constants/api.ts`에서 API 엔드포인트 설정
   - 백엔드 서버가 실행 중인지 확인

## 📱 앱 구조

### 네비게이션 구조
```
App
├── Auth Stack (로그인/회원가입)
└── Main Tab Navigator
    ├── 홈 (Home)
    ├── 기록 (Record Stack)
    │   ├── 운동 기록
    │   ├── 새 운동 생성
    │   ├── 운동 실행
    │   └── 운동 이력
    ├── 통계 (Stats Stack)
    │   ├── 운동 분석
    │   ├── 근력 진행도
    │   ├── 신체 측정
    │   └── 업적
    ├── 소셜 (Social Stack)
    │   ├── 피드
    │   ├── 친구 찾기
    │   ├── 챌린지
    │   └── 프로필
    └── 메뉴 (Menu Stack)
        ├── 프로필 관리
        ├── 설정
        ├── 도움말
        └── 앱 정보
```

### 주요 디렉터리 구조
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── analytics/      # 분석 관련 컴포넌트
│   ├── charts/         # 차트 컴포넌트
│   └── social/         # 소셜 기능 컴포넌트
├── constants/          # 상수 정의
├── navigation/         # 네비게이션 설정
├── screens/           # 화면 컴포넌트
│   ├── auth/          # 인증 관련 화면
│   ├── home/          # 홈 화면
│   ├── record/        # 운동 기록 화면들
│   ├── stats/         # 통계 화면들
│   ├── social/        # 소셜 화면들
│   └── menu/          # 설정 메뉴 화면들
├── services/          # API 및 비즈니스 로직
├── types/             # TypeScript 타입 정의
└── utils/             # 유틸리티 함수
```

## 🛠 기술 스택

### 프론트엔드
- **React Native**: 0.79.5
- **Expo**: ~53.0.20
- **TypeScript**: 5.8.3
- **React Navigation**: 7.x

### 상태 관리 및 데이터
- **AsyncStorage**: 로컬 데이터 저장
- **Axios**: HTTP 클라이언트

### UI/UX
- **React Native Vector Icons**: 아이콘
- **React Native Chart Kit**: 차트 및 그래프
- **React Native Paper**: UI 컴포넌트
- **React Native Modal**: 모달 컴포넌트

### 카메라 및 미디어
- **React Native Image Picker**: 이미지 선택
- **React Native SVG**: SVG 지원

### 푸시 알림
- **Expo Notifications**: 푸시 알림 관리

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: #FF6B6B (메인 컬러)
- **Secondary**: #4ECDC4 (보조 컬러)
- **Accent**: #45B7D1 (강조 컬러)
- **Success**: #00B894 (성공)
- **Warning**: #FDCB6E (경고)
- **Error**: #D63031 (오류)

### 티어 시스템 색상
- **Bronze**: #CD7F32
- **Silver**: #C0C0C0
- **Gold**: #FFD700
- **Platinum**: #E5E4E2
- **Diamond**: #B9F2FF
- **Challenger**: #FF1744

## 📱 빌드 및 배포

### 개발 빌드
```bash
# Android APK 생성
eas build --platform android --profile development

# iOS 시뮬레이터 빌드
eas build --platform ios --profile development
```

### 프로덕션 빌드
```bash
# Android Play Store
eas build --platform android --profile production

# iOS App Store
eas build --platform ios --profile production
```

### 업데이트 배포
```bash
# Over-the-Air 업데이트
eas update --branch production
```

## 🧪 테스트

### 단위 테스트 실행
```bash
npm test
```

### E2E 테스트
- Detox 또는 Maestro를 사용한 E2E 테스트 (설정 필요)

## 📞 지원 및 문의

### 개발팀 연락처
- **이메일**: support@fitness-app.com
- **전화**: 1588-1234 (평일 9시-18시)

### 버그 리포트
GitHub Issues를 통해 버그 신고 및 기능 요청을 해주세요.

### 기여하기
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🔄 업데이트 로그

### v1.0.0 (2025-01-15)
- 초기 릴리스
- 기본 운동 기록 기능
- 소셜 기능 구현
- 푸시 알림 시스템
- 다국어 지원

---

**Korean Fitness App** - 건강한 삶을 위한 당신의 파트너

© 2025 Korean Fitness Team. All rights reserved.