'use client'

import { parseEther } from 'viem'
import { useAccount, useConnect, useDisconnect, useSendTransaction, useSignMessage } from 'wagmi'

import { useState } from 'react'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { sendTransactionAsync } = useSendTransaction()
  const { signMessage, data: signData } = useSignMessage()

  // State for transaction feedback
  const [isLoading, setIsLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleSendTransaction = async () => {
    setIsLoading(true)
    setTxError(null)
    setTxHash(null)
    try {
      const hash = await sendTransactionAsync({
        to: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        value: parseEther('0.001'),
      })
      setTxHash(hash)
    } catch (err: any) {
      setTxError(err?.message || 'Transaction failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800">
      {/* Header */}
      <header className="w-full py-6 bg-gray-950 shadow-md">
        <div className="container mx-auto flex flex-col items-center">
          <span className="text-4xl font-extrabold text-yellow-400 mb-1">🪙</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Coin Cannon</h1>
          <p className="text-gray-300 text-sm md:text-base mt-1">Send ETH with style</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-2 py-8">
        <div className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 flex flex-col gap-7">
          {/* Account Info */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-yellow-200 mb-2">Account</h2>
            <div className="text-gray-700 dark:text-gray-200 text-sm mb-2">
              <span className="font-semibold">Status:</span> {account.status}<br />
              <span className="font-semibold">Sub Account Address:</span>
              <span className="break-all"> {JSON.stringify(account.addresses)}</span><br />
              <span className="font-semibold">ChainId:</span> {account.chainId}
            </div>
            {account.status === 'connected' && (
              <button
                type="button"
                onClick={() => disconnect()}
                className="mt-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow w-full transition"
              >
                Disconnect
              </button>
            )}
          </section>

          {/* Connect Wallet */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-yellow-200 mb-2">Connect</h2>
            {connectors
              .filter((connector) => connector.name === 'Coinbase Wallet')
              .map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  type="button"
                  className="mb-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow w-full transition"
                >
                  Sign in with Smart Wallet
                </button>
              ))}
            <div className="text-xs text-gray-500 mt-1">{status}</div>
            {error?.message && <div className="text-xs text-red-500 mt-1">{error.message}</div>}
          </section>

          {/* Send Transaction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-yellow-200 mb-2">Send Transaction</h2>
            <button
              type="button"
              onClick={handleSendTransaction}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-bold shadow w-full transition text-white ${isLoading ? 'bg-yellow-400 cursor-not-allowed opacity-70' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Send Transaction'}
            </button>
            {isLoading && <div className="text-xs text-yellow-500 animate-pulse mt-2">Transaction is processing...</div>}
            {txError && <div className="text-xs text-red-500 mt-2">Error: {txError}</div>}
            {txHash && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                Transaction sent successfully! 🎉<br />
                <a
                  href={`https://base-sepolia.blockscout.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-700 hover:text-blue-500 dark:text-blue-300"
                >
                  View on Blockscout
                </a>
              </div>
            )}
          </section>

          {/* Sign Message */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-yellow-200 mb-2">Sign Message</h2>
            <button
              type="button"
              onClick={() => signMessage({ message: 'Hello World' })}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shadow w-full transition"
            >
              Sign Message
            </button>
            {signData && <div className="text-xs text-green-600 dark:text-green-400 break-all mt-2">{signData}</div>}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 bg-gray-950 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Coin Cannon
      </footer>
    </div>
  )
}

export default App
