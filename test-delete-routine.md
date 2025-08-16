# Test Delete Routine Functionality

## Test Steps:

1. Open the app and navigate to "루틴 관리" (Routine Management)
2. Create a test routine:
   - Click the + button
   - Name it "테스트 루틴"
   - Add any exercise
   - Save the routine
3. Find the test routine in the list
4. Click the 3-dot menu on the test routine
5. Select "삭제" (Delete) from the bottom sheet
6. Confirm deletion in the confirmation dialog

## Expected Results:
- [ ] Bottom sheet opens with options including delete
- [ ] Delete confirmation dialog appears
- [ ] After confirming, the routine is removed from the list
- [ ] The routine is deleted from AsyncStorage
- [ ] Cannot delete built-in routines (상체 루틴, etc.)

## Debug Steps:
1. Check browser console for any errors
2. Verify that `handleDeleteRoutine` is being called
3. Check if state is being updated properly
4. Verify AsyncStorage is being updated

## Console Logs Added:
- "Deleting routine: [id] [name]"
- "Routine deleted successfully: [id]"