'use client'

import { parseEther } from 'viem'
import { useAccount, useConnect, useDisconnect, useSendTransaction, useSignMessage } from 'wagmi'

import { useState } from 'react'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { sendTransactionAsync } = useSendTransaction()

  // State for transaction feedback
  const [isLoading, setIsLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  // State for dynamic address and amount
  const [sendAddress, setSendAddress] = useState('0xd8da6bf26964af9d7eed9e03e53415d37aa96045')
  const [sendAmount, setSendAmount] = useState('0.001')

  // State for account modal
  const [showAccountModal, setShowAccountModal] = useState(false)

  const handleSendTransaction = async () => {
    setIsLoading(true)
    setTxError(null)
    setTxHash(null)
    try {
      const hash = await sendTransactionAsync({
        to: sendAddress as `0x${string}`,
        value: parseEther(sendAmount),
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
      <header className="w-full flex flex-col items-center mt-8 mb-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight text-center">Coin Cannon</h1>
        </div>
      </header>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold focus:outline-none"
              onClick={() => setShowAccountModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-yellow-200">Account Info</h2>
            <div className="text-gray-700 dark:text-gray-200 text-sm mb-4">
              <span className="font-semibold">Status:</span> {account.status}<br />
              <span className="font-semibold">Sub Account Address:</span>
              <span className="break-all"> {JSON.stringify(account.addresses)}</span><br />
              <span className="font-semibold">ChainId:</span> {account.chainId}
            </div>
            {account.status === 'connected' && (
              <button
                type="button"
                onClick={() => { disconnect(); setShowAccountModal(false); }}
                className="mt-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow w-full transition"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex items-center justify-center px-2 ">
        <div className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-8 flex flex-col gap-7">
          {/* Send Address & Amount Controls */}
          <section className="flex flex-col gap-4">
            <div>
              <label htmlFor="send-address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Send Address</label>
              <input
                id="send-address"
                type="text"
                value={sendAddress}
                onChange={e => setSendAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="send-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Amount (ETH)</label>
              <input
                id="send-amount"
                type="number"
                min="0"
                step="any"
                value={sendAmount}
                onChange={e => setSendAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.001"
                autoComplete="off"
              />
            </div>
          </section>


          {/* Connect or Fire Cannon Section */}
          <section>
            {account.status !== 'connected' ? (
              <>
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
                      Connect to fire
                    </button>
                  ))}
                <div className="text-xs text-gray-500 mt-1">{status}</div>
                {error?.message && <div className="text-xs text-red-500 mt-1">{error.message}</div>}
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-yellow-200 mb-2">Fire Cannon</h2>
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
                      Firing...
                    </span>
                  ) : 'Fire cannon'}
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
              </>
            )}
          </section>

          {/* Account Info Section (only when connected) */}
          {account.status === 'connected' && (
            <section className="flex flex-col items-center mt-6">
              <div className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 w-full text-left">
                <div className="truncate"><span className="font-semibold">Address:</span> {account.addresses?.[0]}</div>
                <div><span className="font-semibold">Chain:</span> {account.chainId}</div>
                <div><span className="font-semibold">Status:</span> {account.status}</div>
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline focus:outline-none bg-transparent p-0 border-0"
                >
                  Disconnect
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-gray-400">
         {new Date().getFullYear()} Coin Cannon
      </footer>
    </div>
  )
}

export default App
