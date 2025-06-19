import React, { createContext, useContext } from 'react'
import { useForm, FormProvider, FieldPath, FieldValues, Controller, Control } from 'react-hook-form'

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
}

const FormFieldContext = createContext<FormFieldContextValue | undefined>(undefined)

interface FormItemContextValue {
  id: string
}

const FormItemContext = createContext<FormItemContextValue | undefined>(undefined)

export function Form<TFieldValues extends FieldValues>({
  children,
  ...props
}: React.ComponentProps<typeof FormProvider<TFieldValues>>) {
  return <FormProvider {...props}>{children}</FormProvider>
}

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>
  name: TName
  render: ({ field, fieldState, formState }: { field: any; fieldState: any; formState: any }) => React.ReactElement
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ control, name, render }: FormFieldProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller
        control={control}
        name={name}
        render={render}
      />
    </FormFieldContext.Provider>
  )
}

export function FormItem({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={`space-y-2 ${className}`} {...props} />
    </FormItemContext.Provider>
  )
}

export function FormLabel({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { id } = useContext(FormItemContext) || {}

  return (
    <label
      className={`text-sm font-medium text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      htmlFor={id}
      {...props}
    />
  )
}

export function FormControl({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { id } = useContext(FormItemContext) || {}

  return <div id={id} {...props} />
}

export function FormDescription({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm text-gray-400 ${className}`}
      {...props}
    />
  )
}

export function FormMessage({ className = '', children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) {
    return null
  }

  return (
    <p
      className={`text-sm font-medium text-red-400 ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}
