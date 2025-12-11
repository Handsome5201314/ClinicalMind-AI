
import { Language } from '../types';

export const TEXTS = {
  en: {
    vitals: { 
      title: 'LIVE MONITORING', 
      hr: 'HR (BPM)', 
      bp: 'BP (mmHg)', 
      spo2: 'SPO2 (%)' 
    },
    dashboard: { 
      title: 'ClinicalMind OS', 
      subtitle: 'Patient Hall v2.4',
      newSim: 'New Simulation', 
      createCustom: 'Create Custom Case',
      generating: 'Synthesizing...', 
      quickGen: 'AI Generated • Random Case', 
      enter: 'Initialize Protocol',
      delete: 'Delete',
      tabs: {
        respiratory: 'Respiratory',
        digestive: 'Digestive',
        emergency: 'Emergency',
        mistakes: 'My Mistakes',
        custom: 'Custom Library'
      }
    },
    studio: {
        title: 'Case Studio',
        subtitle: 'Manual Scenario Editor',
        save: 'Save to Library',
        cancel: 'Cancel',
        placeholders: {
            title: 'e.g. Acute Chest Pain',
            patient: 'e.g. Male, 45 years old',
            cc: 'e.g. "My chest feels like an elephant is sitting on it"',
            history: 'Include HPI, PMH, Meds, Allergies...',
            exam: 'Include Vitals and Physical Findings...',
            labs: 'Include Lab values and Imaging reports...',
            dx: 'Final Diagnosis',
            specialty: 'e.g. Cardiology'
        },
        labels: {
            basicInfo: 'Basic Information',
            clinicalData: 'Clinical Data',
            solution: 'Solution & Key'
        },
        import: {
            button: '⚡ AI Smart Import',
            modalTitle: 'Import Case Data',
            modalDesc: 'Paste a full clinical case description or upload a text file. The AI will parse it into the editor.',
            placeholder: 'Paste raw case text here (e.g. "Patient is a 45yo male presenting with...")',
            analyzing: 'AI Analyzing & Extracting...',
            run: 'Process & Auto-Fill',
            upload: 'Load .txt File',
            close: 'Close'
        }
    },
    his: { 
      title: 'HIS Workstation', 
      subtitle: 'Hospital Information System v4.0',
      tabHist: '[A] History', 
      tabOrder: '[B] Orders', 
      tabDx: '[C] Dx & Plan', 
      submitOrder: 'Submit to Lab System', 
      processing: 'Processing Order...',
      submitRecord: 'Finalize & Submit Record', 
      status: 'STATUS: RECORDING',
      headers: {
        cc: 'Chief Complaint (CC)',
        hpi: 'History of Present Illness (HPI)',
        selectTests: 'Select Tests',
        orderLog: 'Order Log',
        primaryDx: 'Primary Diagnosis',
        plan: 'Management Plan'
      }
    },
    input: { 
      placeholder: 'Enter command / clinical question...', 
      send: 'Enter to Send', 
      shift: 'Shift+Enter for Line',
      term: 'Terminate & Diagnose',
      voice: {
        start: 'Start Voice Call',
        end: 'End Call',
        listening: 'Listening...',
        speaking: 'Patient Speaking...',
        processing: 'Thinking...'
      }
    },
    settings: { 
      title: 'AI Engine Configuration', 
      subtitle: 'CORE SYSTEM PARAMETERS',
      langTitle: 'System Language',
      providerTitle: 'Model Provider',
      modelTitle: 'Model Assignment',
      patientModel: 'Patient Sim Model',
      tutorModel: 'Expert/Tutor Model',
      selectTarget: 'Select which role to assign:',
      searchModels: 'Search models...',
      apiTitle: 'API Key',
      urlTitle: 'API Address',
      themeTitle: 'Visual Theme',
      bgTitle: 'Simulation Background',
      uploadBg: 'Upload Image',
      resetBg: 'Reset Default',
      ping: 'Check',
      save: 'Apply Configuration', 
      cancel: 'CANCEL',
      getKey: 'Get API Key',
      themes: {
        cyanDark: 'Cyan Future (Default)',
        emeraldDark: 'Bio Emerald',
        roseDark: 'Code Red',
        blueLight: 'Clinical Light'
      }
    }
  },
  zh: {
    vitals: { 
      title: '实时监护', 
      hr: '心率 (BPM)', 
      bp: '血压 (mmHg)', 
      spo2: '血氧 (%)' 
    },
    dashboard: { 
      title: '临床思维 OS', 
      subtitle: '接诊大厅 v2.4',
      newSim: '新建模拟', 
      createCustom: '创建自定义病例',
      generating: '生成中...', 
      quickGen: 'AI 生成 • 随机病例', 
      enter: '开始接诊',
      delete: '删除',
      tabs: {
        respiratory: '呼吸内科',
        digestive: '消化内科',
        emergency: '急诊科',
        mistakes: '我的错题本',
        custom: '自定义病例库'
      }
    },
    studio: {
        title: '病例工坊',
        subtitle: '手动剧本编辑器',
        save: '保存至库',
        cancel: '取消返回',
        placeholders: {
            title: '例如：急性胸痛',
            patient: '例如：男性，45岁',
            cc: '例如：“感觉胸口像压了一块大石头”',
            history: '包含现病史、既往史、用药史、过敏史...',
            exam: '包含生命体征和查体阳性体征...',
            labs: '包含实验室检查数值和影像学报告...',
            dx: '最终诊断',
            specialty: '例如：心内科'
        },
        labels: {
            basicInfo: '基本信息',
            clinicalData: '临床数据',
            solution: '诊断与答案'
        },
        import: {
            button: '⚡ AI 智能导入',
            modalTitle: '导入病例数据',
            modalDesc: '粘贴整段病例描述或上传文本文件，AI 将自动解析并填充到编辑器中。',
            placeholder: '在此粘贴原始病例文本 (例如："患者男，45岁，主诉胸痛2小时...")',
            analyzing: 'AI 正在解析提取...',
            run: '识别并填充',
            upload: '上传 .txt 文件',
            close: '关闭'
        }
    },
    his: { 
      title: 'HIS 工作站', 
      subtitle: '医院信息系统 v4.0',
      tabHist: '[A] 病史采集', 
      tabOrder: '[B] 医嘱系统', 
      tabDx: '[C] 诊断方案', 
      submitOrder: '提交检验申请', 
      processing: '系统处理中...',
      submitRecord: '提交病历归档', 
      status: '状态：记录中',
      headers: {
        cc: '主诉 (CC)',
        hpi: '现病史 (HPI)',
        selectTests: '选择检查项目',
        orderLog: '医嘱记录',
        primaryDx: '初步诊断',
        plan: '处置计划'
      }
    },
    input: { 
      placeholder: '输入问诊问题或临床指令...', 
      send: '回车发送', 
      shift: 'Shift+Enter 换行',
      term: '结束诊疗',
      voice: {
        start: '开启语音通话',
        end: '结束通话',
        listening: '正在聆听...',
        speaking: '患者应答中...',
        processing: '思考中...'
      }
    },
    settings: { 
      title: 'AI 引擎配置中心', 
      subtitle: '核心系统参数',
      langTitle: '系统语言',
      providerTitle: '模型提供商',
      modelTitle: '模型角色分配',
      patientModel: '患者模拟模型',
      tutorModel: '专家/导师模型',
      selectTarget: '选择要分配的角色：',
      searchModels: '搜索模型...',
      apiTitle: 'API 密钥',
      urlTitle: 'API 地址',
      themeTitle: '界面主题',
      bgTitle: '诊室背景图',
      uploadBg: '上传图片',
      resetBg: '恢复默认',
      ping: '检测',
      save: '应用配置', 
      cancel: '取消',
      getKey: '点击获取密钥',
      themes: {
        cyanDark: '赛博青 (默认)',
        emeraldDark: '生物绿',
        roseDark: '急诊红',
        blueLight: '临床白'
      }
    }
  }
};

export const t = (lang: Language) => {
  return TEXTS[lang];
};
