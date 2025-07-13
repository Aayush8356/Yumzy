import { 
  userValidation, 
  cartValidation, 
  validateWithSchema, 
  DataSanitizer 
} from '@/lib/validation'

describe('Validation System', () => {
  describe('User Validation', () => {
    describe('Registration', () => {
      it('should validate correct registration data', () => {
        const validData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          phone: '+1234567890'
        }

        const result = validateWithSchema(userValidation.register, validData)
        
        expect(result.success).toBe(true)
        expect(result.data).toEqual(expect.objectContaining({
          name: validData.name,
          email: validData.email.toLowerCase(),
          password: validData.password,
          phone: validData.phone
        }))
      })

      it('should reject invalid registration data', () => {
        const invalidData = {
          name: 'J', // Too short
          email: 'invalid-email',
          password: 'weak', // Too weak
          phone: 'invalid-phone'
        }

        const result = validateWithSchema(userValidation.register, invalidData)
        
        expect(result.success).toBe(false)
        expect(result.errors).toBeDefined()
        expect(Object.keys(result.errors!)).toContain('name')
        expect(Object.keys(result.errors!)).toContain('email')
        expect(Object.keys(result.errors!)).toContain('password')
        expect(Object.keys(result.errors!)).toContain('phone')
      })

      it('should enforce password length requirements', () => {
        const invalidPasswords = [
          '',           // Empty password
          'abc',        // Too short (less than 6 chars)
          '12345',      // Too short (5 chars)
          'a'.repeat(129), // Too long (over 128 chars)
        ]

        invalidPasswords.forEach(password => {
          const result = validateWithSchema(userValidation.register, {
            name: 'Test User',
            email: 'test@example.com',
            password
          })
          
          expect(result.success).toBe(false)
        })

        // Valid passwords should pass
        const validPasswords = [
          'simple123',     // 6+ characters
          'password',      // Simple password is now valid
          'PASSWORD',      // Simple password is now valid
          'Password123',   // Complex password still valid
        ]

        validPasswords.forEach(password => {
          const result = validateWithSchema(userValidation.register, {
            name: 'Test User',
            email: 'test@example.com',
            password
          })
          
          expect(result.success).toBe(true)
        })
      })
    })

    describe('Login', () => {
      it('should validate correct login data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'anypassword'
        }

        const result = validateWithSchema(userValidation.login, validData)
        
        expect(result.success).toBe(true)
        expect(result.data?.email).toBe(validData.email)
      })

      it('should reject invalid login data', () => {
        const invalidData = {
          email: 'invalid-email',
          password: '' // Empty password
        }

        const result = validateWithSchema(userValidation.login, invalidData)
        
        expect(result.success).toBe(false)
        expect(result.errors).toBeDefined()
      })
    })
  })

  describe('Cart Validation', () => {
    it('should validate correct cart item data', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        foodItemId: '123e4567-e89b-12d3-a456-426614174001',
        quantity: 2,
        specialInstructions: 'Extra spicy'
      }

      const result = validateWithSchema(cartValidation.addItem, validData)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject invalid cart item data', () => {
      const invalidData = {
        userId: 'invalid-uuid',
        foodItemId: 'invalid-uuid',
        quantity: 0, // Invalid quantity
        specialInstructions: 'a'.repeat(201) // Too long
      }

      const result = validateWithSchema(cartValidation.addItem, invalidData)
      
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should enforce quantity limits', () => {
      const baseData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        foodItemId: '123e4567-e89b-12d3-a456-426614174001'
      }

      // Test minimum quantity
      const tooLow = validateWithSchema(cartValidation.addItem, {
        ...baseData,
        quantity: 0
      })
      expect(tooLow.success).toBe(false)

      // Test maximum quantity
      const tooHigh = validateWithSchema(cartValidation.addItem, {
        ...baseData,
        quantity: 51
      })
      expect(tooHigh.success).toBe(false)

      // Test valid quantities
      const validQuantities = [1, 25, 50]
      validQuantities.forEach(quantity => {
        const result = validateWithSchema(cartValidation.addItem, {
          ...baseData,
          quantity
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Data Sanitization', () => {
    describe('sanitizeString', () => {
      it('should remove dangerous characters', () => {
        const input = '<script>alert("xss")</script>Test"String\''
        const result = DataSanitizer.sanitizeString(input)
        
        expect(result).not.toContain('<')
        expect(result).not.toContain('>')
        expect(result).not.toContain('"')
        expect(result).not.toContain("'")
        expect(result).toContain('scriptalert(xss)/scriptTestString')
      })

      it('should trim whitespace', () => {
        const input = '  test string  '
        const result = DataSanitizer.sanitizeString(input)
        
        expect(result).toBe('test string')
      })
    })

    describe('sanitizeEmail', () => {
      it('should convert to lowercase and trim', () => {
        const input = '  TEST@EXAMPLE.COM  '
        const result = DataSanitizer.sanitizeEmail(input)
        
        expect(result).toBe('test@example.com')
      })
    })

    describe('sanitizeSearchQuery', () => {
      it('should remove SQL wildcards and dangerous chars', () => {
        const input = '<script>%_test"query\'</script>'
        const result = DataSanitizer.sanitizeSearchQuery(input)
        
        expect(result).not.toContain('%')
        expect(result).not.toContain('_')
        expect(result).not.toContain('<')
        expect(result).not.toContain('>')
        expect(result).not.toContain('"')
        expect(result).not.toContain("'")
      })

      it('should limit length to 100 characters', () => {
        const input = 'a'.repeat(150)
        const result = DataSanitizer.sanitizeSearchQuery(input)
        
        expect(result.length).toBe(100)
      })
    })

    describe('sanitizeNumericString', () => {
      it('should keep only digits and decimal points', () => {
        const input = 'abc123.45def'
        const result = DataSanitizer.sanitizeNumericString(input)
        
        expect(result).toBe('123.45')
      })
    })
  })
})