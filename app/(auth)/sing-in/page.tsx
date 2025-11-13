'use client';

import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn = () => {
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

  const onSubmit = async (data: SignInFormData) => {
    try {
      console.log(data);
      
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold text-white mb-8">
        Welcome Back
      </h1>

      <p className="text-gray-400 mb-8">
        Sign in to continue tracking your investments
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="email"
          label="Email"
          type="email"
          placeholder="your@email.com"
          register={register}
          error={errors.email}
          validation={{ 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          }}
        />

        <InputField
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          register={register}
          error={errors.password}
          validation={{ 
            required: 'Password is required',
            minLength: { value: 6, message: 'Minimum 6 characters' }
          }}
        />

        <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>

        <FooterLink
          text="Don't have an account?"
          linkText="Create an account"
          href="/sing-up"
        />
      </form>
    </>
  )
}

export default SignIn;