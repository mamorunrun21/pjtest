
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 経営・プロジェクトの全体分析
 */
export const analyzeBusinessStatus = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `あなたは建設会社の経営コンサルタントAIです。以下のデータに基づき、経営状況、案件リスク、資金繰りの3点について短く鋭いアドバイスを提供してください。日本語で回答してください。\n\nデータ: ${JSON.stringify(data)}`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "分析を生成できませんでした。";
  }
};

/**
 * 日報の内容からAIがリスクと翌日の指示を生成
 */
export const analyzeDailyReport = async (text: string, images?: string[]) => {
  try {
    const parts: any[] = [{ text: `以下の現場日報の内容から、作業の進捗状況と、安全管理上の懸念点を1つ、翌日の作業者へのアドバイスを1つ抽出してください。\n\n内容: ${text}` }];
    
    if (images && images.length > 0) {
      // 最初の画像のみを分析に使用（トークン節約と速度のため）
      const base64Data = images[0].split(',')[1];
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts }
    });
    return response.text;
  } catch (error) {
    return "AIによる自動要約に失敗しました。";
  }
};

/**
 * 見積構成の最適化提案
 */
export const suggestEstimationOptimization = async (items: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `建設工事の見積項目です。原価率や項目漏れの観点から、収益性を高めるための改善案を1つ提示してください。箇条書きではなく1文で簡潔に。\n\n項目: ${JSON.stringify(items)}`,
    });
    return response.text;
  } catch (error) {
    return null;
  }
};
