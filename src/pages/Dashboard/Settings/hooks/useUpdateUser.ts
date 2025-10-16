import { useClerk } from '@clerk/clerk-react';
import { useState, type ChangeEvent } from 'react';

export const useUpdateUser = () => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { user: clerkUser } = useClerk();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);

    try {
      await clerkUser?.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name, file.size);
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setPasswordError('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage || !clerkUser) return;

    setIsUploadingImage(true);

    try {
      await clerkUser.setProfileImage({ file: selectedImage });
      setSelectedImage(null);
      setImagePreview(null);
      setPasswordError('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return {
    handlePasswordChange,
    handleImageSelect,
    handleImageUpload,
    isUploadingImage,
    isChangingPassword,
    passwordError,
    selectedImage,
    imagePreview,
    passwordData,
    setSelectedImage,
    setImagePreview,
    setPasswordData,
  };
};
