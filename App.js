import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [issueCategory, setIssueCategory] = useState('Technical Issue');
  const [otherDescription, setOtherDescription] = useState('');
  const [message, setMessage] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const categories = ['Account Problem', 'Technical Issue', 'Payment Concern', 'Other'];

  const handleCategorySelect = (cat) => {
    setIssueCategory(cat);
    if (cat === 'Other') {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setOtherDescription('');
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access the media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    if (issueCategory === 'Other' && !otherDescription.trim()) {
      Alert.alert('Validation Error', 'Please describe your custom issue.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Validation Error', 'Please attach a screenshot.');
      return;
    }

    setLoading(true);

    try {
      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const dataUri = `data:image/${fileType === 'png' ? 'png' : 'jpeg'};base64,${base64Image}`;

      const formData = new FormData();
      formData.append('file', dataUri);
      formData.append('upload_preset', uploadPreset);

      const cloudinaryResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      const cloudinaryResult = await cloudinaryResponse.json();

      if (!cloudinaryResult.secure_url) {
        throw new Error(cloudinaryResult.error?.message || 'Failed to upload image to Cloudinary.');
      }

      const uploadedImageUrl = cloudinaryResult.secure_url;
      const serviceID = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
      const templateID = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;
      const privateKey = process.env.EXPO_PUBLIC_EMAILJS_PRIVATE_KEY;

      const finalCategory = issueCategory === 'Other' ? `Other: ${otherDescription}` : issueCategory;

      const emailPayload = {
        service_id: serviceID,
        template_id: templateID,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          name: name,
          reply_to: email,
          issue_category: finalCategory,
          message: message,
          image_url: uploadedImageUrl,
        },
      };

      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        throw new Error(`EmailJS Error: ${errorText || 'Failed to send email'}`);
      }

      Alert.alert('Success', 'Support ticket submitted successfully!');
      
      setName('');
      setEmail('');
      setMessage('');
      setOtherDescription('');
      setImageUri(null);
      setIssueCategory('Technical Issue');
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    } catch (error) {
      console.error(error);
      Alert.alert('Submission Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Customer Support</Text>
          <Text style={styles.headerSubtitle}>We're here to help you solve any issues quickly.</Text>
        </View>

        {/* Form Card (3D Elevated Look) */}
        <View style={styles.card}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Danica Mae"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. danica@example.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Issue Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  issueCategory === cat && styles.selectedCategoryButton,
                ]}
                onPress={() => handleCategorySelect(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    issueCategory === cat && styles.selectedCategoryButtonText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Animated "Other" Description Field */}
          {issueCategory === 'Other' && (
            <Animated.View
              style={{
                opacity: slideAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
                marginTop: 12,
              }}
            >
              <Text style={styles.label}>Please Describe Your Issue</Text>
              <TextInput
                style={styles.input}
                placeholder="Briefly describe what happened..."
                placeholderTextColor="#94a3b8"
                value={otherDescription}
                onChangeText={setOtherDescription}
              />
            </Animated.View>
          )}

          <Text style={styles.label}>Message / Details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide as much detail as possible..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />

          <Text style={styles.label}>Screenshot Evidence</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage} activeOpacity={0.8}>
            <Text style={styles.imagePickerButtonText}>📷 SELECT SCREENSHOT</Text>
          </TouchableOpacity>

          {imageUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.removeImageButtonText}>Remove Image</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>SUBMIT SUPPORT TICKET</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e293b', 
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8, 
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 6,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#f8fafc',
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryButton: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: '#0f172a',
  },
  selectedCategoryButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryButtonText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  selectedCategoryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  imagePickerButton: {
    backgroundColor: '#334155',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  imagePickerButtonText: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  previewContainer: {
    marginTop: 15,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  removeImageButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  removeImageButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 25,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#64748b',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.8,
  },
});