"use client"

import { motion } from "framer-motion"
import { Check, Star } from "lucide-react"

interface PricingOption {
  name: string
  price: string
  features: string[]
  highlighted: boolean
  badge?: string
}

interface PricingGridQuestionProps {
  options: PricingOption[]
  onSelect: (index: number) => void
  disabled: boolean
}

export function PricingGridQuestion({ options, onSelect, disabled }: PricingGridQuestionProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <p className="text-cyan-400 font-mono text-sm mb-4 text-center">
        [ EXPÉRIENCE DIRECTE ] Cliquez sur l&apos;offre que le site VEUT que vous choisissiez
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={option.name}
            onClick={() => !disabled && onSelect(index)}
            disabled={disabled}
            className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
              option.highlighted ? "border-cyan-500 bg-cyan-500/10" : "border-gray-700 bg-gray-800/50"
            } ${!disabled ? "hover:scale-105 hover:border-cyan-400 cursor-pointer" : "cursor-default"}`}
            whileHover={!disabled ? { y: -5 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
          >
            {option.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" />
                {option.badge.replace("⭐ ", "")}
              </div>
            )}

            <h3 className="text-xl font-bold text-white mb-2">{option.name}</h3>
            <p className="text-3xl font-bold text-cyan-400 mb-4">{option.price}</p>

            <ul className="space-y-2">
              {option.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <div
              className={`mt-6 py-2 px-4 rounded-lg text-center font-semibold ${
                option.highlighted ? "bg-cyan-500 text-black" : "bg-gray-700 text-gray-300"
              }`}
            >
              Choisir {option.name}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
