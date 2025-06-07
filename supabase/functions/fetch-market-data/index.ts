import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import yfinance from "npm:yfinance";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pair } = await req.json();

    if (!pair) {
      return new Response(JSON.stringify({ error: "Missing currency pair" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Map currency pairs to yfinance tickers
    const tickerMap: Record<string, string> = {
      "EUR/JPY": "EURJPY=X",
      "EUR/USD": "EURUSD=X",
    };

    const ticker = tickerMap[pair];

    if (!ticker) {
       return new Response(JSON.stringify({ error: `Unsupported currency pair: ${pair}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Fetch real-time data from yfinance
    const data = await yfinance.getQuotes(ticker);

    if (!data || data.length === 0) {
       return new Response(JSON.stringify({ error: `Could not fetch data for ${pair}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const quote = data[0];

    const marketData = {
      pair: pair,
      currentPrice: quote.regularMarketPrice,
      change24h: quote.regularMarketChangePercent,
      timestamp: new Date(quote.regularMarketTime * 1000).toISOString(), // Convert timestamp to ISO string
      volume: quote.regularMarketVolume,
      bid: quote.bid,
      ask: quote.ask,
    };

    // Simulate AI analysis based on fetched data (replace with actual AI logic)
    const analyzeWithAIStrategies = (marketData: any) => {
        const signals = [];

        // 1. Trend Analysis
        const trendDirection = marketData.change24h > 0 ? 'BUY' : 'SELL';
        signals.push({
            direction: trendDirection,
            confidence: Math.min(Math.abs(marketData.change24h) * 2 + 60, 95),
            strategy: 'Analyse de Tendance',
            reasoning: `Tendance ${trendDirection === 'BUY' ? 'haussière' : 'baissière'}`,
            timeframe: '3 minutes',
            riskLevel: Math.abs(marketData.change24h) > 0.5 ? 'HIGH' : 'MEDIUM',
            expectedMove: Math.abs(marketData.change24h) * 0.5
        });

        // 2. Reversal Strategy (Simplified)
        const reversalDirection = marketData.change24h > 1 ? 'SELL' : marketData.change24h < -1 ? 'BUY' : 'HOLD';
         signals.push({
            direction: reversalDirection,
            confidence: (reversalDirection !== 'HOLD') ? 75 : 40,
            strategy: 'Stratégie de Reversal',
            reasoning: reversalDirection !== 'HOLD' ? 'Potentiel renversement détecté' : 'Pas de signal de renversement clair',
            timeframe: '3 minutes',
            riskLevel: reversalDirection !== 'HOLD' ? 'MEDIUM' : 'LOW',
            expectedMove: (reversalDirection !== 'HOLD') ? 0.3 : 0.1
        });

        // 3. Technical Indicators (Placeholder)
         signals.push({
            direction: 'HOLD',
            confidence: 50,
            strategy: 'Indicateurs Techniques',
            reasoning: 'Analyse technique en cours...', // Placeholder
            timeframe: '3 minutes',
            riskLevel: 'MEDIUM',
            expectedMove: 0.2
        });

        // 4. Sentiment Analysis (Placeholder)
         signals.push({
            direction: 'HOLD',
            confidence: 50,
            strategy: 'Analyse de Sentiment',
            reasoning: 'Analyse de sentiment en cours...', // Placeholder
            timeframe: '3 minutes',
            riskLevel: 'LOW',
            expectedMove: 0.1
        });

        // 5. Volatility Analysis (Simplified)
        const volatilityDirection = Math.abs(marketData.change24h) > 0.8 ? 'SELL' : 'BUY';
         signals.push({
            direction: volatilityDirection,
            confidence: Math.min(Math.abs(marketData.change24h) * 30 + 50, 85),
            strategy: 'Analyse de Volatilité',
            reasoning: `Volatilité ${volatilityDirection === 'SELL' ? 'élevée' : 'normale'}`, 
            timeframe: '3 minutes',
            riskLevel: volatilityDirection === 'SELL' ? 'HIGH' : 'MEDIUM',
            expectedMove: Math.abs(marketData.change24h) * 0.4
        });

        // Overall Recommendation (Simplified Consensus)
        const buySignals = signals.filter(s => s.direction === 'BUY').length;
        const sellSignals = signals.filter(s => s.direction === 'SELL').length;
        const overallDirection = buySignals > sellSignals ? 'BUY' : sellSignals > buySignals ? 'SELL' : 'HOLD';
        const overallConfidence = Math.round(signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length);

        const overallRecommendation = {
            direction: overallDirection,
            confidence: overallConfidence,
            strategy: 'Consensus Multi-Stratégies AI',
            reasoning: `${buySignals} signaux d'achat, ${sellSignals} signaux de vente`, 
            timeframe: '3 minutes',
            riskLevel: overallConfidence > 70 ? 'LOW' : overallConfidence > 50 ? 'MEDIUM' : 'HIGH',
            expectedMove: signals.reduce((sum, s) => sum + s.expectedMove, 0) / signals.length
        };

        return {
            marketData,
            signals,
            overallRecommendation,
            analysisTime: new Date().toISOString(),
            strategies: {
                trend: signals[0],
                reversal: signals[1],
                technical: signals[2],
                sentiment: signals[3],
                volatility: signals[4],
            }
        };
    };

    const analysisResult = analyzeWithAIStrategies(marketData);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error fetching market data:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
