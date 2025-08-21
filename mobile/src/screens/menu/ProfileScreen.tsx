import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
// Temporarily disable image picker for Expo Go compatibility
// import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { MenuStackScreenProps } from '../../navigation/types';

type Props = MenuStackScreenProps<'Profile'>;

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  profileImage?: string;
  tier?: string;
  joinDate: string;
  workoutCount: number;
  followersCount: number;
  followingCount: number;
}

export default function ProfileScreen({ navigation }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    username: 'user123',
    email: 'user@example.com',
    firstName: '김',
    lastName: '철수',
    bio: '건강한 삶을 위해 운동하고 있습니다!',
    tier: '브론즈',
    joinDate: '2024-01-15',
    workoutCount: 47,
    followersCount: 23,
    followingCount: 31,
  });

  const [editProfile, setEditProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (isEditing) {
      setEditProfile({ ...profile });
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      // API call to update profile
      setProfile({ ...profile, ...editProfile });
      setIsEditing(false);
      Alert.alert('성공', '프로필이 업데이트되었습니다.');
    } catch (error) {
      Alert.alert('오류', '프로필 업데이트에 실패했습니다.');
    }
  };

  const handleImagePick = async () => {
    // Temporarily disabled for Expo Go compatibility
    Alert.alert(
      '알림', 
      '이미지 선택 기능은 현재 Expo Go에서 사용할 수 없습니다.\n독립 실행형 앱 빌드 시 활성화됩니다.'
    );
    
    // Original code commented out for now:
    // try {
    //   const result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //     allowsEditing: true,
    //     aspect: [1, 1],
    //     quality: 0.8,
    //   });
    //
    //   if (!result.canceled && result.assets[0]) {
    //     const imageUri = result.assets[0].uri;
    //     setEditProfile({ ...editProfile, profileImage: imageUri });
    //   }
    // } catch (error) {
    //   console.error('Error picking image:', error);
    //   Alert.alert('오류', '이미지를 선택할 수 없습니다.');
    // }
  };

  const renderStatsCard = (title: string, value: number, icon: string) => (
    <View style={styles.statCard}>
      <Icon name={icon} size={24} color={Colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? '저장' : '편집'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={isEditing ? handleImagePick : undefined}
          disabled={!isEditing}
        >
          {(isEditing ? editProfile.profileImage : profile.profileImage) ? (
            <Image
              source={{ uri: isEditing ? editProfile.profileImage : profile.profileImage }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={50} color={Colors.textLight} />
            </View>
          )}
          {isEditing && (
            <View style={styles.cameraIcon}>
              <Icon name="camera-alt" size={20} color={Colors.surface} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.userInfo}>
          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                value={editProfile.firstName}
                onChangeText={(text) =>
                  setEditProfile({ ...editProfile, firstName: text })
                }
                placeholder="이름"
              />
              <TextInput
                style={styles.input}
                value={editProfile.lastName}
                onChangeText={(text) =>
                  setEditProfile({ ...editProfile, lastName: text })
                }
                placeholder="성"
              />
              <TextInput
                style={styles.input}
                value={editProfile.username}
                onChangeText={(text) =>
                  setEditProfile({ ...editProfile, username: text })
                }
                placeholder="사용자명"
              />
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={editProfile.bio}
                onChangeText={(text) =>
                  setEditProfile({ ...editProfile, bio: text })
                }
                placeholder="소개"
                multiline
                numberOfLines={3}
              />
            </View>
          ) : (
            <>
              <Text style={styles.userName}>
                {profile.firstName} {profile.lastName}
              </Text>
              <Text style={styles.username}>@{profile.username}</Text>
              <Text style={styles.email}>{profile.email}</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
              <View style={styles.tierContainer}>
                <Icon name="emoji-events" size={16} color={Colors.bronze} />
                <Text style={styles.tier}>{profile.tier} 티어</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        {renderStatsCard('운동', profile.workoutCount, 'fitness-center')}
        {renderStatsCard('팔로워', profile.followersCount, 'people')}
        {renderStatsCard('팔로잉', profile.followingCount, 'person-add')}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>계정 정보</Text>
        <View style={styles.infoItem}>
          <Icon name="email" size={20} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{profile.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="calendar-today" size={20} color={Colors.textSecondary} />
          <Text style={styles.infoText}>
            가입일: {new Date(profile.joinDate).toLocaleDateString('ko-KR')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  editButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  tierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tier: {
    fontSize: 14,
    color: Colors.bronze,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  editForm: {
    width: '100%',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginTop: 12,
    paddingVertical: 20,
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: Colors.surface,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
});