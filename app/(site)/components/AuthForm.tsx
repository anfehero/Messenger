
'use client'

import { useCallback, useState } from "react"
import { FieldValues, useForm, SubmitHandler } from "react-hook-form"

import { BsGithub, BsGoogle } from 'react-icons/bs'

import Input from "@/app/components/inputs/input"
import Button from "@/app/components/Button"
import AuthSocialButton from "./AuthSocialButton"
import axios from "axios"
import { signIn } from 'next-auth/react'

import { toast } from 'react-hot-toast'

type Variant = 'LOGIN' | 'REGISTER'

const AuthForm = () => {

  const [variant, setVariant] = useState<Variant>('LOGIN')
  const [isLoading, setIsLoading] = useState(false)

  const toggleVariant = useCallback(() => {
    if (variant == 'LOGIN') {
      setVariant('REGISTER')

    } else {
      setVariant('LOGIN')
    }
  }, [variant])

  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  })

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true)

    if (variant == 'REGISTER') {
      axios.post('api/register', data)
        .catch(() => toast.error('Something went wrong!'))
        .finally(() => setIsLoading(false))
    }

    if (variant == 'LOGIN') {
      signIn('credentials', {
        ...data,
        redirect: false
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error('Invalid credentials')
          }
          if (callback?.ok && !callback?.error) {
            toast.success('Logged In')
          }
        })
        .finally(() => setIsLoading(false))
    }
  }

  const socialActions = (action: string) => {
    setIsLoading(true)

    signIn(action, { redirect: false})
    .then((callback) => {
      if(callback?.error){
        toast.error('Invalid Credentials')
      }
      if (callback?.ok && !callback?.error) {
        toast.success('Logged In')
      }
    })
    .finally(() => setIsLoading(false))
  }
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm-rounded-lg sm:px-10">
        <form
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}>
          {variant == 'REGISTER' && (

            <Input
              label="Name"
              id="name"
              register={register}
              errors={errors}
              disabled={isLoading}
              type="text"
            />
          )}

          <Input
            label="Email address"
            id="email"
            register={register}
            errors={errors}
            disabled={isLoading}
            type="email"
          />

          <Input
            label="Password"
            id="password"
            register={register}
            errors={errors}
            disabled={isLoading}
            type="password"
          />

          <div>
            <Button
              disabled={isLoading}
              fullWidth
              type="submit"
            >
              {variant == 'LOGIN' ? 'Sign In' : 'Register'}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center ">
              {/* divider */}
              <div className="w-full border-t border-gray-300" />

            </div>

            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialActions('github')}
            />

            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialActions('google')}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>
            {variant == 'LOGIN' ? 'New to Messenger?' : 'Already ha an account?'}
          </div>

          <div onClick={toggleVariant}
            className="underline cursor-pointer">
            {variant == 'LOGIN' ? 'Create an account' : 'Log in'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthForm