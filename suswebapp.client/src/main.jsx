// React 18��StrictMode���C���|�[�g�i�J�����̌x���������j
import { StrictMode } from 'react'
// React 18�̐V���������_�����OAPI���C���|�[�g
import { createRoot } from 'react-dom/client'
// �O���[�o��CSS���C���|�[�g
import './index.css'
// ���C���A�v���P�[�V�����R���|�[�l���g���C���|�[�g
import App from './App.jsx'

/**
 * �A�v���P�[�V�����̃G���g���[�|�C���g
 * React 18�̐V����createRoot API���g�p���ăA�v���P�[�V�����������_�����O
 */

// root�v�f���擾����React���[�g���쐬
createRoot(document.getElementById('root')).render(
    // StrictMode�ň͂ނ��ƂŊJ�����̐��ݓI�Ȗ������o
    // - ����p�̌��o
    // - �p�~�\���API�̎g�p�x��
    // - �\�����Ȃ�����p�̌��o
    <StrictMode>
        <App />  {/* ���C���A�v���P�[�V�����R���|�[�l���g */}
    </StrictMode>,
)

/**
 * StrictMode�̎�ȋ@�\�F
 * 1. ���S�łȂ����C�t�T�C�N�����\�b�h�̌x��
 * 2. ���K�V�[��string ref API�̌x��
 * 3. �p�~�\���findDOMNode�g�p�̌x��
 * 4. �\�����Ȃ�����p�̌��o
 * 5. ���K�V�[��context API�̌��o
 * 6. �ė��p�\�ȏ�Ԃ̊m��
 * 
 * ���ӁFStrictMode�͊J�����ł̂ݓ��삵�A
 * �v���_�N�V�����r���h�ł͎����I�ɍ폜�����
 */