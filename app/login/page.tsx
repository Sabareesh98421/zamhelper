
import AuthForm from '@/app/components/Auth';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Log In to ZamHelper</h1>
        {/* The Auth component will handle the OAuth button */}
        <AuthForm view="sign_in" />
      </div>
    </div>
  );
}
