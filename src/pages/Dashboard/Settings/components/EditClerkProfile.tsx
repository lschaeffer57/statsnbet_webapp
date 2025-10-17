import { useUser } from '@clerk/clerk-react';
import { Camera } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

import { useUpdateUser } from '../hooks/useUpdateUser';
import { getInitials } from '../utils';

const EditClerkProfile = ({ error }: { error: string }) => {
  const {
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
  } = useUpdateUser();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation('settings');
  const { user } = useUser();

  return (
    <Card className="gap-5 p-5">
      <h2 className="text-foreground text-lg font-medium">
        {t('profile.title')}
      </h2>

      <div className="flex items-center gap-4">
        <div className="relative">
          {user?.hasImage && user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="profile"
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-lg font-medium text-white">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
            </div>
          )}
          {imagePreview && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <img
                src={imagePreview}
                alt="preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            iconLeft={<Camera className="size-4" />}
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {t('profile.uploadImageButton')}
          </Button>

          {selectedImage && (
            <div className="flex gap-2">
              <Button
                onClick={handleImageUpload}
                disabled={isUploadingImage}
                size="sm"
                variant="default"
              >
                {isUploadingImage ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <h3 className="text-foreground text-base font-medium">
          {t('profile.changePassword')}
        </h3>

        <Input
          type="password"
          placeholder={t('profile.currentPassword')}
          value={passwordData.currentPassword}
          onChange={(e) =>
            setPasswordData((prev) => ({
              ...prev,
              currentPassword: e.target.value,
            }))
          }
          className="text-white"
          required
        />

        <Input
          type="password"
          placeholder={t('profile.newPassword')}
          value={passwordData.newPassword}
          onChange={(e) =>
            setPasswordData((prev) => ({
              ...prev,
              newPassword: e.target.value,
            }))
          }
          className="text-white"
          required
        />

        <Input
          type="password"
          placeholder={t('profile.confirmPassword')}
          value={passwordData.confirmPassword}
          onChange={(e) =>
            setPasswordData((prev) => ({
              ...prev,
              confirmPassword: e.target.value,
            }))
          }
          className="text-white"
          required
        />

        <Button type="submit" disabled={isChangingPassword} className="w-full">
          {isChangingPassword ? 'Updating...' : t('profile.updatePassword')}
        </Button>
      </form>

      {(passwordError || error) && (
        <p className="text-destructive text-sm">{passwordError || error}</p>
      )}
    </Card>
  );
};

export default EditClerkProfile;
