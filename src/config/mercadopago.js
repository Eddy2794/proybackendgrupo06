import { MercadoPagoConfig } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración centralizada de MercadoPago
 * Maneja las credenciales y configuraciones globales
 */

class MercadoPagoConfiguration {
  constructor() {
    this.validateEnvironmentVariables();
    this.client = this.initializeClient();
  }

  /**
   * Valida que todas las variables de entorno necesarias estén configuradas
   */
  validateEnvironmentVariables() {
    const requiredVars = [
      'MP_ACCESS_TOKEN',
      'MP_PUBLIC_KEY',
      'MP_WEBHOOK_SECRET',
      'MP_WEBHOOK_URL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Las siguientes variables de entorno de MercadoPago son requeridas: ${missingVars.join(', ')}`
      );
    }

    // Validar formato del access token
    // if (!process.env.MP_ACCESS_TOKEN.startsWith('TEST-') && 
    //     !process.env.MP_ACCESS_TOKEN.startsWith('APP_USR-')) {
    //   throw new Error('El formato del MP_ACCESS_TOKEN no es válido');
    // }

    // // Validar formato de la public key
    // if (!process.env.MP_PUBLIC_KEY.startsWith('TEST-') && 
    //     !process.env.MP_PUBLIC_KEY.startsWith('APP_USR-')) {
    //   throw new Error('El formato del MP_PUBLIC_KEY no es válido');
    // }
  }

  /**
   * Inicializa el cliente de MercadoPago
   */
  initializeClient() {
    const config = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
      options: {
        timeout: 30000, // 30 segundos
        idempotencyKey: this.generateIdempotencyKey()
      }
    });

    return config;
  }

  /**
   * Genera una clave de idempotencia única
   */
  generateIdempotencyKey() {
    return `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene el cliente configurado
   */
  getClient() {
    return this.client;
  }

  /**
   * Obtiene las credenciales públicas para el frontend
   */
  getPublicCredentials() {
    return {
      publicKey: process.env.MP_PUBLIC_KEY,
      urls: {
        success: process.env.MP_SUCCESS_URL || 'http://localhost:4200/payments/success',
        failure: process.env.MP_FAILURE_URL || 'http://localhost:4200/payments/failure',
        pending: process.env.MP_PENDING_URL || 'http://localhost:4200/payments/pending'
      }
    };
  }

  /**
   * Obtiene las URLs de configuración
   */
  getUrls() {
    return {
      webhook: process.env.MP_WEBHOOK_URL,
      success: process.env.MP_SUCCESS_URL || 'http://localhost:4200/payments/success',
      failure: process.env.MP_FAILURE_URL || 'http://localhost:4200/payments/failure',
      pending: process.env.MP_PENDING_URL || 'http://localhost:4200/payments/pending'
    };
  }

  /**
   * Verifica si estamos en modo de desarrollo/testing
   */
  isTestMode() {
    return process.env.MP_ACCESS_TOKEN.startsWith('TEST-');
  }

  /**
   * Obtiene la configuración del webhook
   */
  getWebhookConfig() {
    return {
      url: process.env.MP_WEBHOOK_URL,
      secret: process.env.MP_WEBHOOK_SECRET,
      events: ['payment', 'order']
    };
  }

  /**
   * Configuración por defecto para preferencias de pago
   */
  getDefaultPreferenceSettings() {
    return {
      back_urls: this.getUrls(),
      auto_return: 'approved',
      binary_mode: false,
      expires: false,
      external_reference: null,
      notification_url: this.getUrls().webhook,
      statement_descriptor: 'ESCUELA_FUTBOL',
      payment_methods: {
        default_payment_method_id: null,
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12, // Máximo de cuotas permitidas
        default_installments: 1
      },
      shipments: {
        mode: 'not_specified'
      },
      metadata: {
        integration: 'escuela_futbol_v1',
        environment: process.env.NODE_ENV || 'development'
      }
    };
  }

  /**
   * Configuración específica para pagos de cuotas mensuales
   */
  getCuotaPaymentSettings() {
    return {
      ...this.getDefaultPreferenceSettings(),
      statement_descriptor: 'CUOTA_FUTBOL',
      payment_methods: {
        ...this.getDefaultPreferenceSettings().payment_methods,
        installments: 1, // Las cuotas mensuales se pagan en 1 sola cuota
        default_installments: 1
      }
    };
  }

  /**
   * Configuración específica para pagos anuales
   */
  getAnualPaymentSettings() {
    return {
      ...this.getDefaultPreferenceSettings(),
      statement_descriptor: 'PAGO_ANUAL_FUTBOL',
      payment_methods: {
        ...this.getDefaultPreferenceSettings().payment_methods,
        installments: 12, // Los pagos anuales pueden financiarse
        default_installments: 1
      }
    };
  }

  /**
   * Obtiene información del entorno de trabajo
   */
  getEnvironmentInfo() {
    return {
      isTest: this.isTestMode(),
      environment: process.env.NODE_ENV || 'development',
      accessTokenPrefix: process.env.MP_ACCESS_TOKEN.substring(0, 8) + '...',
      webhookConfigured: !!process.env.MP_WEBHOOK_URL,
      timestamp: new Date().toISOString()
    };
  }
}

// Crear instancia singleton
const mercadoPagoConfig = new MercadoPagoConfiguration();

export default mercadoPagoConfig;
