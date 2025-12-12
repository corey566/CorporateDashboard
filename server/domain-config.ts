
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface DomainConfig {
  domain: string;
  port: number;
  enableSSL: boolean;
}

export class DomainConfigService {
  private configPath = '/etc/nginx/sites-available';
  private enabledPath = '/etc/nginx/sites-enabled';

  async configureDomain(config: DomainConfig): Promise<{ success: boolean; message: string }> {
    try {
      // Check if running in Replit - use Replit's built-in domain handling
      if (process.env.REPL_ID) {
        return await this.configureReplitDomain(config);
      }

      // For traditional server setup
      return await this.configureNginxDomain(config);
    } catch (error: any) {
      return {
        success: false,
        message: `Domain configuration failed: ${error.message}`
      };
    }
  }

  private async configureReplitDomain(config: DomainConfig): Promise<{ success: boolean; message: string }> {
    try {
      // Save domain to .env file
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      
      try {
        envContent = await fs.readFile(envPath, 'utf-8');
      } catch (error) {
        // File doesn't exist, will create new one
      }

      // Update or add APP_DOMAIN
      const domainRegex = /^APP_DOMAIN=.*$/m;
      if (domainRegex.test(envContent)) {
        envContent = envContent.replace(domainRegex, `APP_DOMAIN=${config.domain}`);
      } else {
        envContent += `\nAPP_DOMAIN=${config.domain}\n`;
      }

      // Update or add PORT
      const portRegex = /^PORT=.*$/m;
      if (portRegex.test(envContent)) {
        envContent = envContent.replace(portRegex, `PORT=${config.port}`);
      } else {
        envContent += `PORT=${config.port}\n`;
      }

      await fs.writeFile(envPath, envContent);

      return {
        success: true,
        message: `Domain ${config.domain} configured. Please add DNS records in your Replit Deployment settings:\n` +
                 `1. Go to your Deployment settings\n` +
                 `2. Navigate to Domains tab\n` +
                 `3. Add custom domain: ${config.domain}\n` +
                 `4. Follow Replit's DNS setup instructions\n` +
                 `SSL is automatically handled by Replit.`
      };
    } catch (error: any) {
      throw new Error(`Replit domain config failed: ${error.message}`);
    }
  }

  private async configureNginxDomain(config: DomainConfig): Promise<{ success: boolean; message: string }> {
    try {
      // Check if nginx is installed
      try {
        await execAsync('which nginx');
      } catch {
        return {
          success: false,
          message: 'Nginx is not installed. Install it with: sudo apt install nginx'
        };
      }

      const nginxConfig = this.generateNginxConfig(config);
      const configFile = path.join(this.configPath, config.domain);

      // Write nginx configuration
      await fs.writeFile(configFile, nginxConfig);

      // Create symbolic link to enable site
      const symlinkPath = path.join(this.enabledPath, config.domain);
      try {
        await fs.unlink(symlinkPath);
      } catch {
        // Symlink doesn't exist, ignore
      }
      await fs.symlink(configFile, symlinkPath);

      // Test nginx configuration
      const { stderr } = await execAsync('nginx -t');
      if (stderr && !stderr.includes('successful')) {
        throw new Error('Nginx configuration test failed');
      }

      // Reload nginx
      await execAsync('systemctl reload nginx');

      let message = `Domain ${config.domain} configured successfully.\n`;
      message += `Add these DNS records at your domain registrar:\n`;
      message += `  A record: ${config.domain} -> your-server-ip\n\n`;

      if (config.enableSSL) {
        const sslResult = await this.setupSSL(config.domain);
        message += sslResult.message;
      }

      return { success: true, message };
    } catch (error: any) {
      throw new Error(`Nginx configuration failed: ${error.message}`);
    }
  }

  private generateNginxConfig(config: DomainConfig): string {
    return `server {
    listen 80;
    server_name ${config.domain};

    location / {
        proxy_pass http://0.0.0.0:${config.port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://0.0.0.0:${config.port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`;
  }

  private async setupSSL(domain: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if certbot is installed
      try {
        await execAsync('which certbot');
      } catch {
        return {
          success: false,
          message: 'Certbot not installed. Install with: sudo apt install certbot python3-certbot-nginx'
        };
      }

      // Run certbot
      await execAsync(`certbot --nginx -d ${domain} --non-interactive --agree-tos --register-unsafely-without-email`);

      return {
        success: true,
        message: `SSL certificate installed successfully for ${domain}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: `SSL setup failed: ${error.message}. You can manually run: sudo certbot --nginx -d ${domain}`
      };
    }
  }

  async checkDomainStatus(domain: string): Promise<{ configured: boolean; ssl: boolean }> {
    try {
      const configFile = path.join(this.configPath, domain);
      await fs.access(configFile);

      const config = await fs.readFile(configFile, 'utf-8');
      const hasSSL = config.includes('443') || config.includes('ssl');

      return { configured: true, ssl: hasSSL };
    } catch {
      return { configured: false, ssl: false };
    }
  }
}

export const domainConfigService = new DomainConfigService();
