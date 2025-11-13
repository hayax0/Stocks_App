'use client';

import CountrySelectField from "@/components/forms/CountrySelectField";
import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import { Button } from "@/components/ui/button";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";
import { useForm } from "react-hook-form";


interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  country: string;
  investmentGoals: string;
  riskTolerance: string;
  preferredIndustry: string;
}

const SignUp = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      country: 'BR',
      investmentGoals: 'Growth',
      riskTolerance: 'Medium',
      preferredIndustry: 'Technology'
    },
    mode: 'onBlur'
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      console.log(data);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold text-white mb-8">
        Sign Up & Personalize
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="fullName"
          label="Full Name"
          placeholder="Your full Name"
          register={register}
          error={errors.fullName}
          validation={{ required: 'Full name is required', minLength: { value: 2, message: 'Minimum 2 characters' } }}
        />

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
          validation={{ required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } }}
        />

        <CountrySelectField
          name="country"
          label="Country"
          placeholder="Select your country"
          control={control}
          error={errors.country}
          required
        />

        <SelectField
          name="investmentGoals"
          label="Investment Goals"
          placeholder="Select your investment goal"
          options={INVESTMENT_GOALS}
          control={control}
          error={errors.investmentGoals}
          required
        />

        <SelectField
          name="riskTolerance"
          label="Risk Tolerance"
          placeholder="Select your risk level"
          options={RISK_TOLERANCE_OPTIONS}
          control={control}
          error={errors.riskTolerance}
          required
        />

        <SelectField
          name="preferredIndustry"
          label="Preferred Industry"
          placeholder="Select your preferred industry"
          options={PREFERRED_INDUSTRIES}
          control={control}
          error={errors.preferredIndustry}
          required
        />

        <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
          {isSubmitting ? 'Creating Account...' : 'Start Your Investing Journey'}
        </Button>

        <FooterLink
          text="Already have an account?"
          linkText="Sign In"
          href="/sing-in"
        />
      </form>
    </>
  )
}

export default SignUp;