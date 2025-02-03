import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const LGSCalculator = () => {
  const [scores, setScores] = useState({
    Türkçe: { wrong: 2, blank: 1 },
    Tarih: { wrong: 0, blank: 0 },
    Din: { wrong: 0, blank: 0 },
    Dil: { wrong: 0, blank: 0 },
    Matematik: { wrong: 1, blank: 0 },
    Fen: { wrong: 2, blank: 0 }
  });

  const [finalScore, setFinalScore] = useState(null);
  const [testDetails, setTestDetails] = useState([]);

  const testStats = {
    "Türkçe": { mean: 9.22, std: 4.61 },
    "Tarih": { mean: 5.54, std: 2.59 },
    "Din": { mean: 6.45, std: 2.68 },
    "Dil": { mean: 4.59, std: 3.34 },
    "Matematik": { mean: 4.74, std: 4.26 },
    "Fen": { mean: 9.50, std: 5.02 }
  };

  const testWeights = {
    "Matematik": 4,
    "Fen": 4,
    "Türkçe": 4,
    "Dil": 1,
    "Tarih": 1,
    "Din": 1
  };

  const questionCounts = {
    "Türkçe": 20,
    "Tarih": 10,
    "Din": 10,
    "Dil": 10,
    "Matematik": 20,
    "Fen": 20
  };

  const calculateStandardScore = (net, mean, std) => {
    return 50 + 10 * ((net - mean) / std);
  };

  const calculateScores = () => {
    let totalWeightedStandardScores = 0;
    let maxWeightedStandardScores = 0;
    let minWeightedStandardScores = 0;
    const details = [];

    Object.entries(testWeights).forEach(([test, weight]) => {
      const maxNet = questionCounts[test];
      const { mean, std } = testStats[test];
      const questionCount = questionCounts[test];
      const { wrong, blank } = scores[test];
      const net = questionCount - blank - wrong - wrong/3.0;

      const maxStandardScore = calculateStandardScore(maxNet, mean, std);
      const minStandardScore = calculateStandardScore(0, mean, std);
      const standardScore = calculateStandardScore(net, mean, std);

      const weightedMaxScore = maxStandardScore * weight;
      const weightedMinScore = minStandardScore * weight;
      const weightedScore = standardScore * weight;

      maxWeightedStandardScores += weightedMaxScore;
      minWeightedStandardScores += weightedMinScore;
      totalWeightedStandardScores += weightedScore;

      details.push({
        test,
        weight,
        mean,
        std,
        questionCount,
        wrong,
        blank,
        net: net.toFixed(1)
      });
    });

    const MSP = 100 + 400 * (totalWeightedStandardScores - minWeightedStandardScores) / 
      (maxWeightedStandardScores - minWeightedStandardScores);

    setFinalScore(MSP);
    setTestDetails(details);
  };

  useEffect(() => {
    calculateScores();
  }, [scores]);

  const handleInputChange = (test, type, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setScores(prev => ({
      ...prev,
      [test]: {
        ...prev[test],
        [type]: numValue
      }
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          LGS Puan Hesaplama
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border bg-gray-50">Test</th>
                  <th className="p-2 border bg-gray-50">Yanlış</th>
                  <th className="p-2 border bg-gray-50">Boş</th>
                  <th className="p-2 border bg-gray-50">Toplam Soru</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(testWeights).map((test) => (
                  <tr key={test}>
                    <td className="p-2 border font-medium">{test}</td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        min="0"
                        max={questionCounts[test]}
                        value={scores[test].wrong}
                        onChange={(e) => handleInputChange(test, 'wrong', e.target.value)}
                        className="w-16 p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        min="0"
                        max={questionCounts[test]}
                        value={scores[test].blank}
                        onChange={(e) => handleInputChange(test, 'blank', e.target.value)}
                        className="w-16 p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border text-center">{questionCounts[test]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {finalScore && (
            <div className="mt-6">
              <div className="text-center text-2xl font-bold p-4 bg-blue-100 rounded-lg">
                Merkezi Sınav Puanı: {finalScore.toFixed(1)}
              </div>
              
              <div className="mt-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-2 border">Test</th>
                      <th className="p-2 border">Ağırlık</th>
                      <th className="p-2 border">Soru</th>
                      <th className="p-2 border">Yanlış</th>
                      <th className="p-2 border">Boş</th>
                      <th className="p-2 border">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testDetails.map((detail) => (
                      <tr key={detail.test}>
                        <td className="p-2 border">{detail.test}</td>
                        <td className="p-2 border text-center">{detail.weight}</td>
                        <td className="p-2 border text-center">{detail.questionCount}</td>
                        <td className="p-2 border text-center">{detail.wrong}</td>
                        <td className="p-2 border text-center">{detail.blank}</td>
                        <td className="p-2 border text-center">{detail.net}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">2022 Test İstatistikleri</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-2 border bg-gray-50">Test</th>
                      <th className="p-2 border bg-gray-50">Ortalama</th>
                      <th className="p-2 border bg-gray-50">Standart Sapma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(testWeights).map((test) => (
                      <tr key={test}>
                        <td className="p-2 border">{test}</td>
                        <td className="p-2 border text-center">{testStats[test].mean.toFixed(2)}</td>
                        <td className="p-2 border text-center">{testStats[test].std.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LGSCalculator;
