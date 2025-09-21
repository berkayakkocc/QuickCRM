import React, { useState } from 'react'

const ApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testApiConnection = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ API Bağlantısı Başarılı!\n\nStatus: ${response.status}\nMüşteri Sayısı: ${data.length}\n\nVeri: ${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ API Hatası!\n\nStatus: ${response.status}\nHata: ${response.statusText}`)
      }
    } catch (error) {
      setResult(`❌ Bağlantı Hatası!\n\nHata: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">API Bağlantı Testi</h3>
      <button
        onClick={testApiConnection}
        disabled={loading}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Test Ediliyor...' : 'API Bağlantısını Test Et'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}

export default ApiTest
