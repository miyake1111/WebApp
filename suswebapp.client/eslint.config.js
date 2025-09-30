// ESLint�̐����ݒ���C���|�[�g
import js from '@eslint/js'
// �O���[�o���ϐ��̒�`���C���|�[�g�i�u���E�U���Ȃǁj
import globals from 'globals'
// React Hooks�̃��[����񋟂���v���O�C��
import reactHooks from 'eslint-plugin-react-hooks'
// React Fast Refresh�̃��[����񋟂���v���O�C���iHMR�p�j
import reactRefresh from 'eslint-plugin-react-refresh'
// ESLint�̐ݒ�w���p�[�֐����C���|�[�g
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * ESLint�ݒ�̃G�N�X�|�[�g
 * Flat Config�`���iESLint 8.23.0�ȍ~�̐V�`���j���g�p
 */
export default defineConfig([
    // �O���[�o�����O�ݒ� - dist�f�B���N�g���i�r���h���ʕ��j�������Ώۂ��珜�O
    globalIgnores(['dist']),

    {
        // �Ώۃt�@�C�� - JavaScript��JSX�t�@�C���̂�
        files: ['**/*.{js,jsx}'],

        // �p������ݒ�
        extends: [
            js.configs.recommended,                        // JavaScript�W���̐������[��
            reactHooks.configs['recommended-latest'],      // React Hooks�̍ŐV�������[��
            reactRefresh.configs.vite,                    // Vite�pReact Fast Refresh���[��
        ],

        // ����I�v�V�����ݒ�
        languageOptions: {
            ecmaVersion: 2020,                            // ECMAScript 2020�̍\�����T�|�[�g
            globals: globals.browser,                     // �u���E�U�̃O���[�o���ϐ���F��

            // �p�[�T�[�I�v�V����
            parserOptions: {
                ecmaVersion: 'latest',                      // �ŐV��ECMAScript�\�������
                ecmaFeatures: { jsx: true },                // JSX�\����L����
                sourceType: 'module',                       // ES Modules�Ƃ��ĉ��
            },
        },

        // �J�X�^�����[��
        rules: {
            // ���g�p�ϐ��̌��o���[��
            // �啶���܂��̓A���_�[�X�R�A�Ŏn�܂�ϐ��͏��O�i�萔��Ӑ}�I�Ȗ��g�p�ϐ��j
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
        },
    },
])

/**
 * ESLint�ݒ�̎�v�|�C���g�F
 * 
 * 1. Flat Config�`��
 *    - ESLint 8.23.0�ȍ~�̐V�����ݒ�`��
 *    - ��蒼���I�ŏ_��Ȑݒ肪�\
 * 
 * 2. React�J���p�v���O�C��
 *    - react-hooks: useEffect�̈ˑ��z��Ȃǂ̃`�F�b�N
 *    - react-refresh: Hot Module Replacement�̐����������ۏ�
 * 
 * 3. ���O�ݒ�
 *    - dist�f�B���N�g���̓r���h���ʕ��̂��ߌ����s�v
 * 
 * 4. �J�X�^�����[��
 *    - �啶���萔��Ӑ}�I�Ȗ��g�p�ϐ�������
 */