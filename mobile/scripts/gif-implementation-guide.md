
# Steps to Implement New GIFs into Pre-existing Exercises

## 1. Copy GIF Files to Assets Folder
First, copy all Korean GIF files from Downloads to the mobile app assets:

```bash
# Create directories if they don't exist
mkdir -p mobile/assets/exercise-gifs/chest
mkdir -p mobile/assets/exercise-gifs/back
mkdir -p mobile/assets/exercise-gifs/shoulders

# Copy chest exercises
cp "/mnt/c/Users/danny/Downloads/chest exercises"/*.gif mobile/assets/exercise-gifs/chest/

# Copy back exercises  
cp "/mnt/c/Users/danny/Downloads/back exercises"/*.gif mobile/assets/exercise-gifs/back/

# Copy shoulder exercises
cp "/mnt/c/Users/danny/Downloads/shoulder exercises"/*.gif mobile/assets/exercise-gifs/shoulders/
```

## 2. Update Existing Exercises with Korean GIFs

For exercises that already exist in the database but need Korean GIFs:

### Chest Exercises to Update:
- 덤벨 벤치프레스.gif
- 덤벨 인클라인 벤치 프레스.gif
- 덤벨 체스트 플라이.gif
- 디클라인 덤벨 플라이.gif
- 디클라인 바벨 벤치프레스.gif
- 디클라인 케이블 플라이.gif
- 디클라인 플레이트 체스트 프레스.gif
- 딥스.gif
- 머신 디클라인 체스트 프레스.gif
- 머신 체스트 프레스.gif
- 머신 체스트 플라이.gif
- 바벨 벤치프레스.gif
- 바벨 인클라인 벤치 프레스.gif
- 스미스 디클라인 벤치 프레스.gif
- 스미스 벤치 프레스.gif
- 스미스 인클라인 벤치프레스.gif
- 어시스트 딥스.gif
- 원 암 케이블 플라이.gif
- 원 암 플레이트 체스트 프레스.gif
- 인클라인 덤벨 플라이.gif
- 인클라인 케이블 플라이.gif
- 케이블 인클라인 체스트 프레스.gif
- 케이블 체스트 프레스.gif
- 케이블 크로스오버.gif
- 플레이트 디클라인 체스트 프레스.gif
- 플레이트 인클라인 체스트 프레스.gif
- 플레이트 체스트 프레스.gif
- 플레이트 체스트 플라이.gif

### Back Exercises to Update:
- 덤벨 로우.gif
- 랫 풀 다운.gif
- 로잉 머신.gif
- 머신 시티드 로우.gif
- 머신 와이드 풀다운.gif
- 머신 티 바 로우.gif
- 머신 풀오버.gif
- 머신 하이 로우.gif
- 바벨 로우.gif
- 바벨 풀오버.gif
- 비하인드 넥 풀다운.gif
- 스미스 바벨 로우.gif
- 어시스트 풀업.gif
- 언더그립 바벨 로우.gif
- 와이드 케이블 시티드 로우.gif
- 원 암 랫 풀 다운.gif
- 원 암 케이블 로우.gif
- 체스트 서포티드 덤벨 로우.gif
- 체스트 서포티드 바벨로우.gif
- 체스트 서포티드 티바 로우 머신.gif
- 케이블 로우.gif
- 케이블 로프 암 풀 다운.gif
- 케이블 시티드 로우.gif
- 케이블 풀오버.gif
- 클로즈 그립 랫 풀 다운.gif
- 티 바 로우.gif
- 풀업.gif
- 플레이트 로우 로우.gif

### Shoulder Exercises to Update:
- 덤벨 레터럴 레이즈.gif
- 덤벨 벤트오버 레터럴 레이즈.gif
- 리닝 원암 덤벨 레터럴 레이즈.gif
- 머신 레터럴 레이즈 2.gif
- 머신 레터럴 레이즈.gif
- 머신 리어 델트 플라이.gif
- 머신 숄더 프레스 2.gif
- 머신 숄더 프레스.gif
- 바벨 숄더프레스.gif
- 바벨 프론트 레이즈.gif
- 스미스 비하인드 넥 숄더 프레스.gif
- 스탠딩 스미스 숄더 프레스.gif
- 시티드 덤벨 레터럴 레이즈.gif
- 시티드 덤벨 숄더 프레스.gif
- 시티드 덤벨 프론트 레이즈.gif
- 시티드 바벨 숄더 프레스.gif
- 시티드 스미스 숄더 프레스.gif
- 시티드 이지 바 프론트레이즈.gif
- 아놀드 프레스.gif
- 원 암 덤벨 숄더 프레스.gif
- 원 암 덤벨 프레스.gif
- 원 암 케이블 레터럴 레이즈.gif
- 인클라인 리닝 덤벨 레터럴 레이즈.gif
- 케이블 닐링 숄더 프레스.gif
- 케이블 페이스 풀.gif
- 케이블 프론트 레이즈.gif
- 플레이트 프론트 레이즈.gif

## 3. Manual Mapping Required

You'll need to manually map English exercise IDs to Korean GIF names. 
For example:
- 'barbell_bench_press' → '바벨 벤치프레스.gif'
- 'lat_pulldown' → '랫 풀다운.gif'
- 'dumbbell_shoulder_press' → '덤벨 숄더 프레스.gif'

## 4. Upload to Supabase

After updating the database, upload all GIFs to Supabase:

1. Go to Supabase Dashboard
2. Navigate to Storage → exercise-gifs bucket
3. Upload files with English IDs (e.g., barbell_bench_press.gif)
4. The Korean GIF should be renamed to match the exercise ID

## 5. Run Update Script

Use the generated updateWithKoreanGifs.js script to update the database:

```bash
node scripts/updateWithKoreanGifs.js
```
