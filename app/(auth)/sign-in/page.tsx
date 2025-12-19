'use client';

import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/better-auth/auth-client";
import { Github } from "lucide-react";

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur'
  });

  const handleGithubSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  };

  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signInWithEmail(data);

      if (result.success) {
        toast.success("Login successful!");
        router.refresh();
        router.push("/");
      } else {
        toast.error("Email or password incorrect.");
      }

    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred.");
    }
  }

  return (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold text-white mb-8">
        Welcome Back
      </h1>

      <div className="space-y-4 mb-8">

        <Button
          onClick={handleGithubSignIn}
          className="w-full bg-[#24292e] hover:bg-[#2f363d] text-white flex items-center gap-2 h-12 border border-gray-700"
          type="button"
        >
          <Github className="w-5 h-5" />
          Sign in with GitHub
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">

            <span className="bg-black px-2 text-gray-500">Or continue with</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="email"
          label="Email"
          type="email"
          placeholder="your@email.com"
          register={register}
          error={errors.email}
          validation={{ required: 'Email is required' }}
        />

        <InputField
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          register={register}
          error={errors.password}
          validation={{ required: 'Password is required' }}
        />

        <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>

        <FooterLink
          text="Don't have an account?"
          linkText="Create an account"
          href="/sign-up"
        />
      </form>
    </>
  )
}

export default SignIn;