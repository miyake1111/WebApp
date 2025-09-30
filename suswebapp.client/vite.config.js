// Node.js��URL����p���[�e�B���e�B
import { fileURLToPath, URL } from 'node:url';
// Vite�̐ݒ��`�֐�
import { defineConfig } from 'vite';
// React�pVite�v���O�C��
import plugin from '@vitejs/plugin-react';
// �t�@�C���V�X�e������p
import fs from 'fs';
// �p�X����p
import path from 'path';
// �q�v���Z�X���s�p�i�ؖ��������Ɏg�p�j
import child_process from 'child_process';
// ���ϐ��A�N�Z�X�p
import { env } from 'process';

/**
 * HTTPS�ؖ����̐ݒ�
 * ASP.NET Core�J���p�̎��ȏ����ؖ������g�p
 */

// �ؖ����ۑ��t�H���_�[�̌���iWindows/Mac/Linux�Ή��j
const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`              // Windows: %APPDATA%/ASP.NET/https
        : `${env.HOME}/.aspnet/https`;                // Mac/Linux: ~/.aspnet/https

// �ؖ������i�v���W�F�N�g���ƈ�v�j
const certificateName = "suswebapp.client";

// �ؖ����t�@�C���̃p�X
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);  // �ؖ����{��
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);   // �閧��

// �ؖ����t�H���_�[�����݂��Ȃ��ꍇ�͍쐬
if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });    // �e�f�B���N�g�����܂߂č쐬
}

// �ؖ��������݂��Ȃ��ꍇ�͐���
if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    // dotnet dev-certs�R�}���h�ŏؖ����𐶐�
    if (0 !== child_process.spawnSync('dotnet', [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,                                // �o�͐�p�X
        '--format',
        'Pem',                                       // PEM�`���ŏo��
        '--no-password',                             // �p�X���[�h�Ȃ�
    ], { stdio: 'inherit', }).status) {              // �W�����o�͂��p��
        throw new Error("Could not create certificate.");
    }
}

// �o�b�N�G���h�T�[�o�[��URL�ݒ�
// ASP.NET Core�o�b�N�G���h�̃f�t�H���g�|�[�g
const target = 'http://localhost:61319';

/**
 * Vite�ݒ�̃G�N�X�|�[�g
 * https://vitejs.dev/config/
 */
export default defineConfig({
    // �v���O�C���ݒ�
    plugins: [plugin()],                            // React�v���O�C�����g�p

    // �p�X�����ݒ�
    resolve: {
        alias: {
            // @��src�f�B���N�g���̃G�C���A�X�Ƃ��Đݒ�
            // import '@/components/...' �̂悤�ȋL�@���\��
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },

    // �J���T�[�o�[�ݒ�
    server: {
        // �v���L�V�ݒ�iAPI���N�G�X�g���o�b�N�G���h�ɓ]���j
        proxy: {
            // /api�Ŏn�܂郊�N�G�X�g
            '^/api': {
                target,                              // �o�b�N�G���hURL
                secure: false,                       // SSL�ؖ����̌��؂��X�L�b�v
                changeOrigin: true                   // Origin�w�b�_�[��ύX
            },
            // /weatherforecast�G���h�|�C���g�i�T���v��API�j
            '^/weatherforecast': {
                target,                              // �o�b�N�G���hURL
                secure: false                        // SSL�ؖ����̌��؂��X�L�b�v
            }
        },

        // �J���T�[�o�[�̃|�[�g�ԍ�
        // ���ϐ� DEV_SERVER_PORT ���ݒ肳��Ă���΂�����g�p�A�Ȃ����61317
        port: parseInt(env.DEV_SERVER_PORT || '61317'),

        // HTTPS�ݒ�i���ȏ����ؖ������g�p�j
        https: {
            key: fs.readFileSync(keyFilePath),      // �閧����ǂݍ���
            cert: fs.readFileSync(certFilePath),    // �ؖ�����ǂݍ���
        }
    }
})

/**
 * Vite�ݒ�̎�v�|�C���g�F
 * 
 * 1. HTTPS�J���T�[�o�[
 *    - ASP.NET Core�Ɠ����ؖ������g�p
 *    - �Z�L���A�ȊJ�������
 * 
 * 2. �v���L�V�ݒ�
 *    - /api���N�G�X�g���o�b�N�G���h�ɓ]��
 *    - CORS�G���[�����
 * 
 * 3. �p�X�G�C���A�X
 *    - @��src�f�B���N�g���̃V���[�g�J�b�g�Ƃ��Ďg�p
 *    - �C���|�[�g�����Ȍ��ɋL�q�\
 * 
 * 4. React Fast Refresh
 *    - �v���O�C���ɂ�莩���I�ɗL����
 *    - �J�����̍��������[�h������
 * 
 * 5. �|�[�g�ݒ�
 *    - �t�����g�G���h: 61317�i�f�t�H���g�j
 *    - �o�b�N�G���h: 61319
 *    - ���ϐ��ŕύX�\
 */