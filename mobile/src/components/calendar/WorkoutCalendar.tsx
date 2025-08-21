import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface WorkoutCalendarProps {
  onDateSelect?: (date: Date) => void;
  workoutDates?: Date[];
  photoDates?: Date[];
  measurementDates?: Date[];
  selectedDate?: Date;
}

type ViewMode = '운동' | '포토' | '신체';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasWorkout: boolean;
  hasPhoto: boolean;
  hasMeasurement: boolean;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

export default function WorkoutCalendar({
  onDateSelect,
  workoutDates = [],
  photoDates = [],
  measurementDates = [],
  selectedDate,
}: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('운동');
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, workoutDates, photoDates, measurementDates]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        hasWorkout: workoutDates.some(d => isSameDay(d, currentDate)),
        hasPhoto: photoDates.some(d => isSameDay(d, currentDate)),
        hasMeasurement: measurementDates.some(d => isSameDay(d, currentDate)),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Ensure we always have 42 days (6 weeks) for consistent height
    while (days.length < 42) {
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: false,
        hasWorkout: false,
        hasPhoto: false,
        hasMeasurement: false,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setCalendarDays(days);
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getDotColor = (day: CalendarDay): string | null => {
    switch (viewMode) {
      case '운동':
        return day.hasWorkout ? Colors.primary : null;
      case '포토':
        return day.hasPhoto ? Colors.success : null;
      case '신체':
        return day.hasMeasurement ? Colors.warning : null;
      default:
        return null;
    }
  };

  const getMultipleDots = (day: CalendarDay): string[] => {
    const dots: string[] = [];
    if (day.hasWorkout) dots.push(Colors.primary);
    if (day.hasPhoto) dots.push(Colors.success);
    if (day.hasMeasurement) dots.push(Colors.warning);
    return dots;
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (onDateSelect && day.isCurrentMonth) {
      onDateSelect(day.date);
    }
  };

  const getMonthStats = (): { count: number; label: string } => {
    const currentMonthDays = calendarDays.filter(day => day.isCurrentMonth);
    
    switch (viewMode) {
      case '운동':
        const workoutCount = currentMonthDays.filter(day => day.hasWorkout).length;
        return { count: workoutCount, label: '운동일' };
      case '포토':
        const photoCount = currentMonthDays.filter(day => day.hasPhoto).length;
        return { count: photoCount, label: '사진' };
      case '신체':
        const measurementCount = currentMonthDays.filter(day => day.hasMeasurement).length;
        return { count: measurementCount, label: '측정' };
      default:
        return { count: 0, label: '' };
    }
  };

  const monthStats = getMonthStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'<'}</Text>
        </TouchableOpacity>
        
        <View style={styles.monthYearContainer}>
          <Text style={styles.monthYear}>
            {currentMonth.getFullYear()}년 {MONTHS[currentMonth.getMonth()]}
          </Text>
          <Text style={styles.monthStats}>
            {monthStats.count}회 {monthStats.label}
          </Text>
        </View>
        
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewModeContainer}>
        {(['운동', '포토', '신체'] as ViewMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.viewModeButton, viewMode === mode && styles.viewModeButtonActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.weekDaysContainer}>
        {DAYS_OF_WEEK.map((day, index) => (
          <Text
            key={day}
            style={[
              styles.weekDay,
              index === 0 && styles.sundayText,
              index === 6 && styles.saturdayText,
            ]}
          >
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          const isSelected = selectedDate && isSameDay(day.date, selectedDate);
          const dotColor = getDotColor(day);
          const multipleDots = viewMode === '운동' ? getMultipleDots(day) : [];

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.otherMonthDay,
                isToday(day.date) && styles.todayCell,
                isSelected && styles.selectedDay,
              ]}
              onPress={() => handleDateSelect(day)}
              disabled={!day.isCurrentMonth}
            >
              <Text
                style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.otherMonthDayText,
                  isToday(day.date) && styles.todayText,
                  isSelected && styles.selectedDayText,
                  day.date.getDay() === 0 && styles.sundayText,
                  day.date.getDay() === 6 && styles.saturdayText,
                ]}
              >
                {day.date.getDate()}
              </Text>
              
              {viewMode !== '운동' && dotColor && (
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
              )}
              
              {viewMode === '운동' && multipleDots.length > 0 && (
                <View style={styles.dotsContainer}>
                  {multipleDots.map((color, i) => (
                    <View
                      key={i}
                      style={[styles.smallDot, { backgroundColor: color }]}
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>운동</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>포토</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
          <Text style={styles.legendText}>신체측정</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: '600',
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  monthStats: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  viewModeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.primary,
  },
  viewModeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  dayText: {
    fontSize: 16,
    color: Colors.text,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  otherMonthDayText: {
    color: Colors.textSecondary,
  },
  todayCell: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 16,
  },
  todayText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  selectedDay: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sundayText: {
    color: Colors.error,
  },
  saturdayText: {
    color: Colors.secondary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 2,
  },
  smallDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});