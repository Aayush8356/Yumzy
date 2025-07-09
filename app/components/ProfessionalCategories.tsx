'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { 
  getPrimaryCategories, 
  getCuisineCategories, 
  getCourseCategories,
  professionalFilters 
} from '@/data/professional-categories'

interface ProfessionalCategoriesProps {
  onCategorySelect?: (categoryId: string, level: string) => void
  selectedCategory?: string
  level?: 'primary' | 'cuisine' | 'course' | 'all'
}

export function ProfessionalCategories({ 
  onCategorySelect, 
  selectedCategory, 
  level = 'all' 
}: ProfessionalCategoriesProps) {
  const [activeTab, setActiveTab] = useState('primary')
  
  const primaryCategories = getPrimaryCategories()
  const cuisineCategories = getCuisineCategories()
  const courseCategories = getCourseCategories()
  const spiceFilters = professionalFilters.find(f => f.id === 'spice-level')?.values || []
  
  const handleCategoryClick = (categoryId: string, categoryLevel: string) => {
    onCategorySelect?.(categoryId, categoryLevel)
  }

  return (
    <div className="w-full space-y-6">
      {/* Professional Categories Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Browse by Categories</h2>
        <p className="text-muted-foreground">Professional food categorization system</p>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="primary">Dietary Preference</TabsTrigger>
          <TabsTrigger value="cuisine">Cuisine Type</TabsTrigger>
          <TabsTrigger value="course">Meal Course</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>

        {/* Primary Dietary Categories */}
        <TabsContent value="primary" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {primaryCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${category.colorScheme.background} ${category.colorScheme.accent} ${
                    selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleCategoryClick(category.id, 'primary')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className={`font-semibold text-sm ${category.colorScheme.text}`}>
                      {category.name}
                    </h3>
                    <p className={`text-xs mt-1 ${category.colorScheme.text} opacity-80`}>
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Cuisine Categories */}
        <TabsContent value="cuisine" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cuisineCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${category.colorScheme.background} ${category.colorScheme.accent} ${
                    selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleCategoryClick(category.id, 'cuisine')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className={`font-semibold text-sm ${category.colorScheme.text}`}>
                      {category.name}
                    </h3>
                    <p className={`text-xs mt-1 ${category.colorScheme.text} opacity-80`}>
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Course Categories */}
        <TabsContent value="course" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {courseCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${category.colorScheme.background} ${category.colorScheme.accent} ${
                    selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleCategoryClick(category.id, 'course')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h3 className={`font-semibold text-sm ${category.colorScheme.text}`}>
                      {category.name}
                    </h3>
                    <p className={`text-xs mt-1 ${category.colorScheme.text} opacity-80`}>
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Filters */}
        <TabsContent value="filters" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionalFilters.map((filter) => (
              <Card key={filter.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span>{filter.icon}</span>
                    {filter.displayName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filter.values.map((value) => (
                    <Badge 
                      key={value.id} 
                      variant="outline" 
                      className="mr-2 mb-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {value.icon && <span className="mr-1">{value.icon}</span>}
                      {value.name}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{primaryCategories.length}</div>
            <div className="text-sm text-muted-foreground">Dietary Options</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{cuisineCategories.length}</div>
            <div className="text-sm text-muted-foreground">Cuisine Types</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{courseCategories.length}</div>
            <div className="text-sm text-muted-foreground">Meal Courses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{professionalFilters.length}</div>
            <div className="text-sm text-muted-foreground">Filter Options</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalCategories