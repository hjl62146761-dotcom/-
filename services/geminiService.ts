
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StructuredReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const EXTRACTION_SYSTEM_PROMPT = `당신은 회사 주간업무 보고서 분석 AI입니다.
입력은 PPT 슬라이드 텍스트/표/메모입니다.
목표는 보고서 내용을 추적 가능한 구조화 데이터(JSON)로 추출하는 것입니다.

규칙:
1. 절대 임의로 수치/사실을 만들어내지 않는다. 없으면 null 또는 "미기재"로 둔다.
2. ‘계획(Plan) / 실적(Actual) / 차이(Delta) / 이슈(Risk) / 다음주 액션(Next)’를 우선적으로 분해한다.
3. 가능한 경우, 정량 지표는 number로, 통화는 currency로, 단위(unit)를 분리한다.
4. 원문 근거 문장(quote)은 1~2줄만 짧게 남긴다.
5. 출력은 오직 유효한 JSON만 반환한다.`;

const SUMMARY_SYSTEM_PROMPT = `당신은 임원 보고용 “주간업무 요약 보고서(Word)” 작성 AI입니다.
입력은 구조화 JSON이며, 출력은 ‘워드에 붙여넣기 좋은’ 한국어 문서 형태(제목/소제목/표/불릿)로 만듭니다.

원칙:
1. 첫 페이지: (1) 이번주 총평 (2) 신호등(그린/옐로/레드) 요약 (3) Top 리스크 3 (4) 다음주 우선순위 5
2. 본문: 조직별로 “핵심 성과 / 미달 원인 / 리스크 / 다음 액션(담당/기한)”을 고정 포맷으로 반복
3. 계획 대비 실적이 있는 항목은 반드시 ‘계획 vs 실적 vs 차이’ 문장 또는 표로 표현
4. 숫자/단위/통화는 원문 단위를 유지하고 임의 변환 금지
5. 과장 금지, 짧고 단정하게`;

const TRACKING_SYSTEM_PROMPT = `당신은 주간업무의 추적/진척 관리 AI입니다.
입력은 (A) 이번주 JSON, (B) 지난주/과거주 JSON 목록입니다.
목표:
1. 이번주 계획 항목이 실적으로 전환되었는지 매칭
2. 동일 과제의 상태 변화(신호등 변화, 일정 지연, 범위 변경)를 탐지
3. 반복 리스크/상습 지연을 요약

규칙:
- 항목 매칭은 title, tags, org_unit 유사도로 판단하되, 불확실하면 “추정” 표시
- 출력은 ‘경영진용 1페이지 요약 + 상세 매칭 리스트’로 만든다.`;

export const geminiService = {
  async extractReport(metaInput: string, textInput: string): Promise<StructuredReport> {
    const prompt = `[메타]\n${metaInput}\n\n[슬라이드 텍스트]\n${textInput}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    try {
      const data = JSON.parse(response.text || '{}');
      return {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      };
    } catch (e) {
      console.error("JSON Parsing Error", e);
      throw new Error("Failed to parse AI response into JSON");
    }
  },

  async generateSummary(reportJson: StructuredReport): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `[JSON]\n${JSON.stringify(reportJson, null, 2)}`,
      config: {
        systemInstruction: SUMMARY_SYSTEM_PROMPT,
      },
    });
    return response.text || "";
  },

  async trackProgress(thisWeek: StructuredReport, history: StructuredReport[]): Promise<string> {
    const prompt = `[이번주]\n${JSON.stringify(thisWeek, null, 2)}\n\n[과거주]\n${JSON.stringify(history, null, 2)}`;
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: TRACKING_SYSTEM_PROMPT,
      },
    });
    return response.text || "";
  },

  async chatWithKnowledgeBase(question: string, context: StructuredReport[]): Promise<string> {
    const contextPrompt = context.map(r => `[${r.report_meta.week_label}] ${JSON.stringify(r.sections)}`).join("\n\n");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `[질문]\n${question}\n\n[검색결과 context]\n${contextPrompt}`,
      config: {
        systemInstruction: `당신은 ‘주간업무 보고서 지식베이스’ 챗봇입니다. 
        context에 근거가 있으면 요약하여 답하고, 없으면 자료에서 확인되지 않는다고 말하십시오. 
        항상 (주차, 조직, 항목명)을 포함하십시오. 문서ID: YYYY-WW_조직_카테고리_항목명 형태 유지.`,
      },
    });
    return response.text || "";
  }
};
