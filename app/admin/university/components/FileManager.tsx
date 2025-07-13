'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  File, 
  FileText, 
  Image, 
  Video,
  Radio,
  Archive,
  Eye,
  EyeOff
} from 'lucide-react'

interface FileData {
  _id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  entityType: 'course' | 'assignment' | 'student' | 'general'
  entityId?: string
  tags: string[]
  isPublic: boolean
  downloadCount: number
  uploadedBy: {
    fullName: string
    email: string
  }
  createdAt: string
}

interface FileResponse {
  success: boolean
  files: FileData[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function FileManager() {
  const [files, setFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [entityType, setEntityType] = useState('general')
  const [tags, setTags] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [search])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const response = await fetch(`/api/admin/university/files?${params}`)
      const data: FileResponse = await response.json()
      
      if (data.success) {
        setFiles(data.files)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('entityType', entityType)
      formData.append('tags', tags)
      formData.append('isPublic', isPublic.toString())

      const response = await fetch('/api/admin/university/files', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        setSelectedFile(null)
        setTags('')
        setIsPublic(false)
        fetchFiles()
      } else {
        alert('Upload failed: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/admin/university/files?fileId=${fileId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        fetchFiles()
      } else {
        alert('Delete failed: ' + data.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Delete failed')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4 text-blue-400" />
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4 text-purple-400" />
    if (mimeType.startsWith('audio/')) return <Radio className="w-4 h-4 text-green-400" />
    if (mimeType.includes('pdf')) return <FileText className="w-4 h-4 text-red-400" />
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="w-4 h-4 text-blue-400" />
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileText className="w-4 h-4 text-green-400" />
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-4 h-4 text-orange-400" />
    return <File className="w-4 h-4 text-gray-400" />
  }

  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-500/20 text-blue-400'
      case 'assignment':
        return 'bg-amber-500/20 text-amber-400'
      case 'student':
        return 'bg-indigo-500/20 text-indigo-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Upload Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="bg-white/5 border-white/10"
            />
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
            >
              <option value="general">General</option>
              <option value="course">Course</option>
              <option value="assignment">Assignment</option>
              <option value="student">Student</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-white/5 border-white/10"
            />
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              Public
            </label>
          </div>
          
          <Button
            onClick={handleFileUpload}
            disabled={!selectedFile || uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
      </div>

      {/* Files List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-white/60 mt-2">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="text-center py-8">
              <File className="w-12 h-12 mx-auto text-white/40 mb-4" />
              <p className="text-white/60">No files found</p>
            </CardContent>
          </Card>
        ) : (
          files.map((file) => (
            <Card key={file._id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.mimeType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {file.originalName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/60">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-xs text-white/40">•</span>
                        <span className="text-xs text-white/60">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-white/40">•</span>
                        <span className="text-xs text-white/60">
                          {file.downloadCount} downloads
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getEntityTypeColor(file.entityType)}`}>
                          {file.entityType}
                        </Badge>
                        {file.isPublic ? (
                          <Badge className="text-xs bg-green-500/20 text-green-400">
                            <Eye className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-gray-500/20 text-gray-400">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      {file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {file.tags.map((tag, index) => (
                            <Badge key={index} className="text-xs bg-white/10 text-white/60">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileDelete(file._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 