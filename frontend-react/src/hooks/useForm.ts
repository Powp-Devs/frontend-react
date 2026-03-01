import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(options.initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               value
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await options.onSubmit(values);
    } catch (error: any) {
      setErrors({ general: error.message || 'Erro ao enviar formulário' });
    } finally {
      setIsSubmitting(false);
    }
  }, [values, options]);

  const resetForm = useCallback(() => {
    setValues(options.initialValues);
    setErrors({});
  }, [options.initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setValues
  };
}
