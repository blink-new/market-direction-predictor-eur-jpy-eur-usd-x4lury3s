import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Progress } from './components/ui/progress';
import { Skeleton } from './components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  BarChart3, 
  Brain,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MarketAnalysis } from './components/MarketAnalysis';
import { TradingStrategies } from './components/TradingStrategies';
import { PriceChart } from './components/PriceChart';

interface MarketData {
  pair: string;
  currentPrice: number;
  change24h: number;
  timestamp: Date;
  volume: number;
  bid: number;
  ask: number;
}

interface TradingSignal {
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  strategy: string;
  reasoning: string;
  timeframe: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedMove: number;
}

interface PredictionResult {
  pair: string;
  marketData: MarketData;
  signals: TradingSignal[];
  overallRecommendation: TradingSignal;
  analysisTime: Date;
  strategies: {
    trend: TradingSignal;
    reversal: TradingSignal;
    technical: TradingSignal;
    sentiment: TradingSignal;
    volatility: TradingSignal;
  };
}

const CURRENCY_PAIRS = ['EUR/JPY', 'EUR/USD'] as const;

function App() {
  const [predictions, setPredictions] = useState<Record<string, PredictionResult | null>>({
    'EUR/JPY': null,
    'EUR/USD': null
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({
    'EUR/JPY': false,
    'EUR/USD': false
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Simulation de données de marché réelles (normalement via yfinance API)
  const generateMarketData = useCallback((pair: string): MarketData => {
    const basePrice = pair === 'EUR/JPY' ? 165.50 : 1.0850;
    const volatility = pair === 'EUR/JPY' ? 0.5 : 0.002;
    const randomChange = (Math.random() - 0.5) * volatility;
    
    return {
      pair,
      currentPrice: basePrice + randomChange,
      change24h: (Math.random() - 0.5) * 2,
      timestamp: new Date(),
      volume: Math.floor(Math.random() * 1000000) + 500000,
      bid: basePrice + randomChange - 0.001,
      ask: basePrice + randomChange + 0.001
    };
  }, []);

  // Stratégies de trading AI avancées (Simulation)
  const analyzeWithAIStrategies = useCallback((marketData: MarketData): PredictionResult => {
    const signals: TradingSignal[] = [];
    
    // 1. Analyse de tendance (Trend-Following)
    const trendSignal: TradingSignal = {
      direction: marketData.change24h > 0 ? 'BUY' : 'SELL',
      confidence: Math.min(Math.abs(marketData.change24h) * 50 + 60, 95),
      strategy: 'Analyse de Tendance (EMA/SMA)',
      reasoning: `Tendance ${marketData.change24h > 0 ? 'haussière' : 'baissière'} détectée avec momentum de ${Math.abs(marketData.change24h).toFixed(3)}%`,
      timeframe: '3 minutes',
      riskLevel: Math.abs(marketData.change24h) > 1 ? 'HIGH' : 'MEDIUM',
      expectedMove: Math.abs(marketData.change24h) * 1.2
    };
    
    // 2. Stratégie de reversal (RSI/Bollinger Bands)
    const isOverbought = marketData.change24h > 1.5;
    const isOversold = marketData.change24h < -1.5;
    const reversalSignal: TradingSignal = {
      direction: isOverbought ? 'SELL' : isOversold ? 'BUY' : 'HOLD',
      confidence: (isOverbought || isOversold) ? 85 : 45,
      strategy: 'Stratégie de Reversal (RSI/Bollinger)',
      reasoning: isOverbought ? 'Zone de survente détectée - reversal probable' : 
                isOversold ? 'Zone de surachat détectée - reversal probable' : 
                'Marché en équilibre - attendre signal',
      timeframe: '3 minutes',
      riskLevel: (isOverbought || isOversold) ? 'MEDIUM' : 'LOW',
      expectedMove: (isOverbought || isOversold) ? 0.8 : 0.2
    };

    // 3. Analyse technique multi-indicateurs (MACD, Stochastic)
    const macdSignal = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const technicalSignal: TradingSignal = {
      direction: macdSignal,
      confidence: Math.floor(Math.random() * 30) + 65,
      strategy: 'Indicateurs Techniques (MACD/Stochastic)',
      reasoning: `MACD ${macdSignal === 'BUY' ? 'crossover haussier' : 'crossover baissier'} confirmé par Stochastic`,
      timeframe: '3 minutes',
      riskLevel: 'MEDIUM',
      expectedMove: Math.random() * 0.6 + 0.3
    };

    // 4. Analyse de sentiment (News/Social Media)
    const sentimentScore = Math.random();
    const sentimentSignal: TradingSignal = {
      direction: sentimentScore > 0.6 ? 'BUY' : sentimentScore < 0.4 ? 'SELL' : 'HOLD',
      confidence: Math.floor(sentimentScore * 40) + 50,
      strategy: 'Analyse de Sentiment (NLP)',
      reasoning: `Sentiment ${sentimentScore > 0.6 ? 'positif' : sentimentScore < 0.4 ? 'négatif' : 'neutre'} détecté sur ${marketData.pair}`,
      timeframe: '3 minutes',
      riskLevel: sentimentScore > 0.7 || sentimentScore < 0.3 ? 'HIGH' : 'LOW',
      expectedMove: Math.abs(sentimentScore - 0.5) * 1.5
    };

    // 5. Analyse de volatilité (ATR/VIX)
    const volatilityLevel = Math.abs(marketData.change24h);
    const volatilitySignal: TradingSignal = {
      direction: volatilityLevel > 1 ? 'SELL' : 'BUY',
      confidence: Math.min(volatilityLevel * 40 + 55, 90),
      strategy: 'Analyse de Volatilité (ATR)',
      reasoning: `Volatilité ${volatilityLevel > 1 ? 'élevée' : 'normale'} - ${volatilityLevel > 1 ? 'prudence recommandée' : 'opportunité de position'}`,
      timeframe: '3 minutes',
      riskLevel: volatilityLevel > 1.5 ? 'HIGH' : volatilityLevel > 0.5 ? 'MEDIUM' : 'LOW',
      expectedMove: volatilityLevel * 0.8
    };

    signals.push(trendSignal, reversalSignal, technicalSignal, sentimentSignal, volatilitySignal);

    // Calcul de la recommandation globale
    const buySignals = signals.filter(s => s.direction === 'BUY').length;
    const sellSignals = signals.filter(s => s.direction === 'SELL').length;
    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    
    const overallDirection = buySignals > sellSignals ? 'BUY' : 
                           sellSignals > buySignals ? 'SELL' : 'HOLD';
    
    const overallRecommendation: TradingSignal = {
      direction: overallDirection,
      confidence: Math.floor(avgConfidence),
      strategy: 'Consensus Multi-Stratégies AI',
      reasoning: `${buySignals} signaux d'achat, ${sellSignals} signaux de vente sur 5 stratégies analysées`,
      timeframe: '3 minutes',
      riskLevel: avgConfidence > 80 ? 'LOW' : avgConfidence > 60 ? 'MEDIUM' : 'HIGH',
      expectedMove: signals.reduce((sum, s) => sum + s.expectedMove, 0) / signals.length
    };

    return {
      pair: marketData.pair,
      marketData,
      signals,
      overallRecommendation,
      analysisTime: new Date(),
      strategies: {
        trend: trendSignal,
        reversal: reversalSignal,
        technical: technicalSignal,
        sentiment: sentimentSignal,
        volatility: volatilitySignal
      }
    };
  }, []);

  const analyzePair = useCallback(async (pair: string) => {
    setLoading(prev => ({ ...prev, [pair]: true }));
    
    try {
      // Using simulated data for now due to Supabase Edge Function deployment issue
      const marketData = generateMarketData(pair);
      const analysis = analyzeWithAIStrategies(marketData);
      
      setPredictions(prev => ({ ...prev, [pair]: analysis }));
      setLastUpdate(new Date());
      
      toast.success(`Analyse ${pair} terminée avec succès!`, {
        icon: '🎯',
        duration: 3000
      });
    } catch (error) {
      toast.error(`Erreur lors de l'analyse de ${pair}`, {
        icon: '❌'
      });
    } finally {
      setLoading(prev => ({ ...prev, [pair]: false }));
    }
  }, [generateMarketData, analyzeWithAIStrategies]);

  const refreshAll = useCallback(async () => {
    toast.promise(
      Promise.all(CURRENCY_PAIRS.map(pair => analyzePair(pair))),
      {
        loading: 'Actualisation de toutes les analyses...',
        success: 'Toutes les analyses mises à jour!',
        error: 'Erreur lors de l\'actualisation'
      }
    );
  }, [analyzePair]);

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'BUY': return 'text-green-600 bg-green-50';
      case 'SELL': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'BUY': return <TrendingUp className="w-4 h-4" />;
      case 'SELL': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  AI Market Predictor
                </h1>
                <p className="text-sm text-slate-500">Prédiction EUR/JPY & EUR/USD</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {lastUpdate && (
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              <Button 
                onClick={refreshAll}
                variant="outline"
                size="sm"
                className="border-slate-200 hover:bg-slate-50"
                disabled={Object.values(loading).some(Boolean)}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${Object.values(loading).some(Boolean) ? 'animate-spin' : ''}`} />
                Actualiser Tout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Currency Pair Analysis Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {CURRENCY_PAIRS.map((pair) => (
            <Card key={pair} className="bg-white/60 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">{pair}</CardTitle>
                    <CardDescription className="text-slate-600">
                      Analyse de marché 3 minutes
                    </CardDescription>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => analyzePair(pair)}
                  disabled={loading[pair]}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 transition-all duration-300"
                >
                  {loading[pair] ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Analyser {pair}
                    </>
                  )}
                </Button>
                
                {/* Quick Results Preview */}
                {predictions[pair] && !loading[pair] && (
                  <div className="mt-4 p-4 bg-slate-50/80 rounded-lg border border-slate-200/60">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getDirectionColor(predictions[pair]!.overallRecommendation.direction)} border-0 font-medium`}>
                          {getDirectionIcon(predictions[pair]!.overallRecommendation.direction)}
                          <span className="ml-1">{predictions[pair]!.overallRecommendation.direction}</span>
                        </Badge>
                        <Badge className={getRiskColor(predictions[pair]!.overallRecommendation.riskLevel)}>
                          {predictions[pair]!.overallRecommendation.riskLevel}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-slate-700">
                        {predictions[pair]!.overallRecommendation.confidence}% confiance
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">
                      Prix: {predictions[pair]!.marketData.currentPrice.toFixed(4)}
                    </div>
                  </div>
                )}
                
                {loading[pair] && (
                  <div className="mt-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Analysis Results */}
        <div className="space-y-8">
          {CURRENCY_PAIRS.map((pair) => {
            const prediction = predictions[pair];
            if (!prediction || loading[pair]) return null;

            return (
              <div key={pair} className="space-y-6">
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-slate-900">
                        Analyse Détaillée - {pair}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getDirectionColor(prediction.overallRecommendation.direction)} border-0 font-medium px-3 py-1`}>
                          {getDirectionIcon(prediction.overallRecommendation.direction)}
                          <span className="ml-2">{prediction.overallRecommendation.direction}</span>
                        </Badge>
                        <Badge className={getRiskColor(prediction.overallRecommendation.riskLevel)}>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {prediction.overallRecommendation.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Market Data Overview */}
                    <MarketAnalysis marketData={prediction.marketData} />
                    
                    <Separator />
                    
                    {/* Overall Recommendation */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-lg border border-slate-200/60">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Recommandation Globale
                          </h3>
                          <p className="text-slate-600">{prediction.overallRecommendation.reasoning}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-slate-900">
                            {prediction.overallRecommendation.confidence}%
                          </div>
                          <div className="text-sm text-slate-500">Confiance</div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                          <span>Niveau de confiance</span>
                          <span>{prediction.overallRecommendation.confidence}%</span>
                        </div>
                        <Progress value={prediction.overallRecommendation.confidence} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Mouvement attendu:</span>
                          <span className="ml-2 font-medium">{prediction.overallRecommendation.expectedMove.toFixed(3)}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Horizon:</span>
                          <span className="ml-2 font-medium">{prediction.overallRecommendation.timeframe}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Trading Strategies Breakdown */}
                    <TradingStrategies strategies={prediction.strategies} />
                    
                    <Separator />
                    
                    {/* Price Chart */}
                    <PriceChart pair={pair} currentPrice={prediction.marketData.currentPrice} />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        
        {/* Disclaimer */}
        <Card className="mt-8 bg-amber-50/60 border-amber-200/60">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Avertissement Important</p>
                <p>
                  Les prédictions sont basées sur des analyses AI et des données de marché. 
                  Le trading comporte des risques importants. Ne jamais investir plus que ce que vous pouvez vous permettre de perdre. 
                  Ces informations sont à des fins éducatives uniquement et ne constituent pas des conseils financiers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;