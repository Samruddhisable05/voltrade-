'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getMarketplace } from '../../lib/api';
import BuyEnergyModal from '../../components/BuyEnergyModal';
import CreateOfferModal from '../../components/CreateOfferModal';
import { 
  ShoppingBag, 
  Sun, 
  Sparkles, 
  Zap, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  TrendingDown,
  RefreshCw,
  Search
} from 'lucide-react';

export default function MarketplacePage() {
  const { currentUser } = useApp();
  const [offers, setOffers] = useState<any[]>([]);
  const [pricingRec, setPricingRec] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMarketplace = async () => {
    setLoading(true);
    try {
      const data = await getMarketplace();
      if (data) {
        setOffers(data.offers || []);
        setPricingRec(data.pricingRecommendation || null);
      }
    } catch (err) {
      console.error('Marketplace fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplace();
    const interval = setInterval(fetchMarketplace, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleBuyClick = (offer: any) => {
    setSelectedOffer(offer);
    setIsBuyModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Marketplace Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            P2P ORDER BOOK
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Renewable Energy Marketplace
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Purchase solar electricity directly from local producers with instant cryptographic settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'PRODUCER' && (
            <button
              onClick={() => setIsOfferModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              List Energy for Sale
            </button>
          )}

          <button
            onClick={fetchMarketplace}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Refresh order book"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Price Bar Alert */}
      {pricingRec && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white flex items-center gap-1.5">
                AI Price Recommendation:
                <span className="text-emerald-400 font-mono text-sm">₹{pricingRec.recommendedPrice.toFixed(2)}/kWh</span>
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">{pricingRec.reason}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400">Microgrid Status:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
              Supply: {pricingRec.supplyLevel}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/30">
              Demand: {pricingRec.demandLevel}
            </span>
          </div>
        </div>
      )}

      {/* Offers Grid */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-4 h-4 text-emerald-400" />
            Available Solar Energy Offers ({offers.length})
          </h2>
          <span className="text-xs text-slate-400">Sorted by best price per kWh</span>
        </div>

        {offers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-300">No active offers right now</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Producers are currently accumulating solar energy. Check back shortly or create a listing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer) => {
              const isOwner = currentUser.id === offer.userId;

              return (
                <div
                  key={offer.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-5 shadow-xl transition flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400/90 tracking-wider">
                          Solar Producer
                        </span>
                        <h3 className="text-sm font-bold text-white mt-0.5 group-hover:text-emerald-400 transition">
                          {offer.producerName || 'House A (Solar)'}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {offer.status}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Available</span>
                        <div className="text-lg font-black text-white font-mono mt-0.5">
                          {offer.remainingEnergy.toFixed(2)}
                          <span className="text-xs font-normal text-slate-400 ml-1">kWh</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Tariff</span>
                        <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                          ₹{offer.pricePerKwh.toFixed(2)}
                          <span className="text-xs font-normal text-slate-400 ml-1">/kWh</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-between items-center text-xs px-1 text-slate-400">
                      <span>Estimated Total Pool:</span>
                      <span className="font-mono text-white font-bold">
                        ₹{(offer.remainingEnergy * offer.pricePerKwh).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-800">
                    {isOwner ? (
                      <div className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs text-center font-medium">
                        Your Energy Listing
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuyClick(offer)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        BUY ENERGY
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Buy Modal */}
      <BuyEnergyModal
        offer={selectedOffer}
        isOpen={isBuyModalOpen}
        onClose={() => {
          setIsBuyModalOpen(false);
          setSelectedOffer(null);
        }}
        onSuccess={() => {
          fetchMarketplace();
        }}
      />

      {/* Producer Offer Modal */}
      <CreateOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSuccess={() => {
          fetchMarketplace();
        }}
      />

    </div>
  );
}
