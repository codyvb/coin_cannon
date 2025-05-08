'use client'

import React, { useState, useEffect } from 'react'
import { parseEther } from 'viem'
import { useAccount, useConnect, useDisconnect, useSendTransaction, useSignMessage } from 'wagmi'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { sendTransactionAsync } = useSendTransaction()

  // State for transaction feedback
  const [isLoading, setIsLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  // State for dynamic address, amount, and frequency
  const [sendAddress, setSendAddress] = useState('0x40FF52E1848660327F16ED96a307259Ec1D757eB')
  const [sendAmount, setSendAmount] = useState('0.00001')
  const [frequency, setFrequency] = useState(1)

  // Toast stack state
  type ToastType = 'success' | 'error' | 'processing'
  interface Toast {
    id: number
    type: ToastType
    message: string
    link?: string
  }
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = React.useRef(0)

  function addToast(toast: Omit<Toast, 'id'>, duration = 7000) {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id))
    }, duration)
  }

  // Toast and flash state
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error' | 'processing' | null>(null)
  const [toastMessage, setToastMessage] = useState<string>('')
  const [toastLink, setToastLink] = useState<string | null>(null)
  const [flashGreen, setFlashGreen] = useState(false)
  const [flashRed, setFlashRed] = useState(false)

  // State for account modal (unused, but left for completeness if needed)
  const [showAccountModal, setShowAccountModal] = useState(false)

  const handleSendTransaction = async () => {
    setIsLoading(true)
    setTxError(null)
    setTxHash(null)
    for (let i = 0; i < frequency; i++) {
      addToast({ type: 'processing', message: `Transaction ${i+1} of ${frequency} is processing...` }, 10000)
      try {
        const hash = await sendTransactionAsync({
          to: sendAddress as `0x${string}`,
          value: parseEther(sendAmount),
        })
        setTxHash(hash)
        addToast({
          type: 'success',
          message: `Transaction ${i+1} sent! 🎉`,
          link: `https://base-sepolia.blockscout.com/tx/${hash}`
        })
        setFlashGreen(true)
        setTimeout(() => setFlashGreen(false), 1000)
      } catch (err: any) {
        let msg = err?.message || 'Transaction failed';
        if (msg.includes('transfer amount exceeds balance')) {
          msg = 'Sub wallet is out of ETH.';
        }
        addToast({ type: 'error', message: `Tx ${i+1} failed: ${msg}` })
        setFlashRed(true)
        setTimeout(() => setFlashRed(false), 1000)
      }
    }
    setIsLoading(false)
  }

  // No need for single processing toast effect with stacked toasts

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start md:justify-center from-neutral-900 via-neutral-950 to-neutral-800 transition-colors duration-500 ${flashGreen ? 'bg-green-400' : ''} ${flashRed ? 'bg-red-500' : ''}`}>
      {/* Header */}
      <header className="w-full flex flex-col items-center mt-8 mb-6 md:mt-0 md:mb-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight text-center">Coin Cannon</h1>
        </div>
      </header>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-2xl font-bold focus:outline-none"
              onClick={() => setShowAccountModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-yellow-200">Account Info</h2>
            <div className="text-neutral-700 dark:text-neutral-200 text-sm mb-4">
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
      <main className="flex items-center justify-center px-2 md:px-0 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-full mx-2 sm:mx-0 sm:w-[421.16px] bg-white/90 dark:bg-neutral-800 rounded-2xl shadow-xl p-8 flex flex-col gap-7">
          {/* Send Address & Amount Controls */}
          <section className="flex flex-col gap-4">
            <div>
              <label htmlFor="send-address" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Send Address</label>
              <input
                id="send-address"
                type="text"
                value={sendAddress}
                onChange={e => setSendAddress(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="send-amount" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Amount (ETH)</label>
              <input
                id="send-amount"
                type="number"
                min="0"
                step="any"
                value={sendAmount}
                onChange={e => setSendAmount(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.001"
                autoComplete="off"
              />
            </div>
            {/* Frequency Selector */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Frequency</label>
              <div className="flex mt-4 gap-3 w-full">
                {[1, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFrequency(num)}
                    className={`flex-1 px-4 py-1 rounded-lg border font-semibold transition text-sm text-center
                      ${frequency === num ? 'bg-neutral-500 text-white border-neutral-900 shadow' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 hover:bg-blue-100 dark:hover:bg-neutral-600'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </section>


          {/* Connect or Fire Cannon Section */}
          <section>
            {account.status !== 'connected' ? (
              <>
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
                {error?.message && <div className="text-xs text-red-500 mt-1">{error.message}</div>}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSendTransaction}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg font-bold shadow w-full transition text-white ${isLoading ? 'bg-yellow-400 cursor-not-allowed opacity-70' : 'bg-green-800 hover:bg-green-700'}`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Firing...
                    </span>
                  ) : 'Fire Cannon'}
                </button>


              </>
            )}
          </section>

          {/* Account Info Section (only when connected) */}
          {account.status === 'connected' && (
            <section className="flex flex-col items-center">
              <div className=" bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-200 w-full text-left">
                <div className="truncate"><span className="font-semibold">Address:</span> {account.addresses?.[1]}</div>
                <div className="truncate"><span className="font-semibold">Sub:</span> {account.addresses?.[0]}</div>
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

      {/* Toast stack for transaction status */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-md flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast, idx) => (
          <div
            key={toast.id}
            className={`flex flex-col sm:flex-row items-center justify-between gap-3 bg-white text-neutral-900 px-5 py-4 rounded-xl shadow-2xl animate-slideup-fade border-l-8
              ${toast.type === 'success' ? 'border-green-500' : ''}
              ${toast.type === 'error' ? 'border-red-500' : ''}
              ${toast.type === 'processing' ? 'border-yellow-400' : ''}
              ${toast.type === 'processing' ? 'animate-pulse' : ''}
            `}
            style={{
              animationDelay: `${idx * 0.08}s`,
              pointerEvents: 'auto',
            }}
          >
            <span className={`font-semibold text-base sm:text-lg
              ${toast.type === 'error' ? 'text-red-600' : ''}
              ${toast.type === 'processing' ? 'text-yellow-600' : ''}
            `}>{toast.message}</span>
            {toast.type === 'success' && toast.link && (
              <a
                href={toast.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 sm:mt-0 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow transition underline-offset-2 focus:outline-none"
              >
                View on Blockscout
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-neutral-400">
         {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default App
