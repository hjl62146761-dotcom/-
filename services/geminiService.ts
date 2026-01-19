
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StructuredReport, KpiTimeSeries } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_IDENTITY = `너의 공식 이름은 “Smart 주간업무 AJ AI”다. 모든 역할 인식, 내부 지칭, 출력 문서, 보고서 제목, 요약 헤더, 시스템 응답에서 항상 이 이름을 사용한다. 

[Smart 주간업무 AJ AI 기본 수칙]
1. 스스로를 지칭할 때 반드시 “Smart 주간업무 AJ AI”라고 부른다. 
2. 보고서 제목에는 반드시 「Smart 주간업무 AJ AI – 주간업무 보고 요약」 형식을 사용한다.
3. 사용자가 파일을 업로드하면 텍스트 입력 유무와 상관없이 파일 내용을 즉시 분석한다.
4. "파일을 열 수 없다"는 응답은 절대 금지한다.`;

const EXTRACTION_SYSTEM_PROMPT = `${SYSTEM_IDENTITY}

너는 “Smart 주간업무 AJ AI”로서 주간업무 보고서 PDF/PPT 자동 분석을 수행하여 정형화된 JSON 데이터를 추출한다.

[분석 절차]
1. PDF/PPT 전체 구조 파악 및 주간업무 보고서 형식 판단.
2. 계획(Plan) / 실적(Actual) / 이슈 / 리스크 분류.
3. 이슈 ID 생성: [ORG]-[CATEGORY]-[KEYWORD]-[YYYY]-[SEQ]
4. 데이터가 없는 항목은 절대 추정하지 말고 null 또는 “미기재” 표시.

[출력 형식: JSON]
{
  "report_meta": { "week": "", "report_date": "", "source": "uploaded_file" },
  "summary": {
    "overall_status": "Green|Yellow|Red|Mixed",
    "key_messages": [],
    "top_risks": [],
    "next_week_priorities": []
  },
  "details": [
    {
      "issue_id": "",
      "section": "",
      "org_unit": "",
      "category": "KPI|PROJECT|FINANCE|RISK|OPERATION",
      "item": "",
      "plan": "",
      "actual": "",
      "gap": "",
      "status": "Green|Yellow|Red|Unknown",
      "owner": "",
      "next_action": ""
    }
  ]
}`;

const SUMMARY_SYSTEM_PROMPT = `${SYSTEM_IDENTITY}

너는 “Smart 주간업무 AJ AI”로서 임원 보고용 “Word 파일용 문서 형식” 요약을 생성한다. 
모든 출력은 Microsoft Word에 그대로 붙여넣었을 때 서식이 유지되도록 작성해야 하며, 반드시 "표(Table)" 중심으로 구성한다.

[Word 문서 구성 규칙 - 아래 5개 섹션 필수]
1. 표지 및 보고 개요: 「Smart 주간업무 AJ AI – 주간업무 보고 요약」 제목, 보고서 ID, 주차, 파일명, 생성일.
2. 전사 요약 (표): 총평, 종합 상태(신호등), 핵심 키워드 3개를 포함하는 표.
3. 계획 대비 실적 요약 (표): [조직 | 항목 | 계획 | 실적 | 차이 | 상태] 컬럼의 상세 성과 표.
4. 주요 이슈 및 리스크 (표): [이슈 ID | 리스크 내용 | 대응 방안 | 담당자] 컬럼의 리스크 관리 표.
5. Action Item (표): [항목 | 기대 결과 | 담당 | 기한] 컬럼의 차주 실행 계획 표.

[문체] 
- 명확하고 간결한 보고체.
- 자유 서술보다는 표 안의 정제된 텍스트 선호.
- 파일에 없는 정보는 "미기재"로 표시.`;

const TRACKING_SYSTEM_PROMPT = `${SYSTEM_IDENTITY}

너는 “Smart 주간업무 AJ AI”로서 누적 분석 및 변화 추적 리포트를 생성한다. 
최근 보고서들 간의 변화를 "표(Table)" 형태로 정리하여 경영진이 한 페이지로 파악할 수 있게 한다.

[분석 필수 항목 - 모두 표 형식]
1. 주차별 핵심 변화 비교 표: [항목 | 지난주 상태 | 이번주 상태 | 주요 변화]
2. 누적 이슈/리스크 추적 표: [이슈 ID | 발생 주차 | 현황 | 지연 여부] (2주 이상 반복 시 강조)
3. 계획 대비 지속 미달 항목 표: [조직 | 항목 | 3주 누적 Gap | 사유]
4. 경영진용 종합 제언

자유 서술을 지양하고 구조화된 표를 사용하여 변화를 가시화하라.`;

export interface FileData {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export const geminiService = {
  async extractReport(textInput: string, files: FileData[] = []): Promise<StructuredReport> {
    const parts = [
      { text: textInput || "Smart 주간업무 AJ AI로서 첨부된 파일을 기반으로 주간업무 데이터를 추출하고 JSON으로 변환해줘." },
      ...files
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    try {
      const cleanJson = response.text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);
      return {
        ...data,
        id: Math.random().toString(36).substr(2, 6).toUpperCase(), // 정형화된 요약 ID
        createdAt: Date.now()
      };
    } catch (e) {
      console.error("JSON Parsing Error", e);
      throw new Error("Smart 주간업무 AJ AI 분석 실패: 파일 구조를 파악할 수 없습니다.");
    }
  },

  async generateSummary(reportJson: StructuredReport): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `[REPORT ID: ${reportJson.id}]\n[JSON DATA]\n${JSON.stringify(reportJson, null, 2)}`,
      config: {
        systemInstruction: SUMMARY_SYSTEM_PROMPT,
      },
    });
    return response.text || "";
  },

  async trackProgress(thisWeek: StructuredReport, history: StructuredReport[]): Promise<string> {
    const prompt = `[CURRENT REPORT: ${thisWeek.id}]\n[CURRENT DATA]\n${JSON.stringify(thisWeek, null, 2)}\n\n[HISTORY DATA]\n${JSON.stringify(history.slice(0, 5), null, 2)}`;
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: TRACKING_SYSTEM_PROMPT,
      },
    });
    return response.text || "";
  },

  async extractKpiTimeSeries(reports: StructuredReport[]): Promise<KpiTimeSeries[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `[REPORTS DATA]\n${JSON.stringify(reports, null, 2)}`,
      config: {
        systemInstruction: `${SYSTEM_IDENTITY}\n\nSmart 주간업무 AJ AI: KPI 항목만 추출하여 시계열 JSON으로 변환하라.`,
        responseMimeType: "application/json",
      },
    });
    try {
      return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (e) {
      return [];
    }
  },

  async chatWithKnowledgeBase(question: string, context: StructuredReport[]): Promise<string> {
    const contextPrompt = context.map(r => `[ID: ${r.id}] [주차: ${r.report_meta.week}] [파일: ${r.report_meta.source}] 상세: ${JSON.stringify(r.details)}`).join("\n\n");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `[USER QUESTION]\n${question}\n\n[HISTORY CONTEXT]\n${contextPrompt}`,
      config: {
        systemInstruction: `${SYSTEM_IDENTITY}\n\n너는 Smart 주간업무 AJ AI 기반의 지식베이스 챗봇이다. 
사용자가 "이전 요약", "지난번 보고서", "요약 ID [XXXX]"를 물어보면 히스토리 데이터를 조회하여 답변한다. 
반드시 답변에 해당 리포트의 ID와 주차를 명시하라.`,
      },
    });
    return response.text || "";
  }
};
