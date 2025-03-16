import React from "react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from '@/components/ui/chart';
import { HardDrive, File, FileArchive, FileImage, FileText, FileVideo, FileAudio } from 'lucide-react';

const Analysis = () => {
  // Fetch all notes with their categories and timestamps for the current user
  const { data: notes = [], isLoading: isNotesLoading } = useQuery({
    queryKey: ['notes-analysis'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session.user.id)
        .is('deleted_at', null);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch files data for analysis
  const { data: files = [], isLoading: isFilesLoading } = useQuery({
    queryKey: ['files-analysis'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', session.user.id)
        .is('deleted_at', null);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch folders data for analysis
  const { data: folders = [], isLoading: isFoldersLoading } = useQuery({
    queryKey: ['folders-analysis'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('user_folders')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = isNotesLoading || isFilesLoading || isFoldersLoading;

  // Notes analysis calculations
  const categoryUsage = notes.reduce((acc: Record<string, number>, note) => {
    acc[note.category] = (acc[note.category] || 0) + 1;
    return acc;
  }, {});

  const mostUsedCategory = Object.entries(categoryUsage).sort((a, b) => b[1] - a[1])[0];

  const calculateWordsInText = (text: string) => text.trim().split(/\s+/).length;

  const getWordsPerPeriod = (startDate: Date, endDate: Date) => {
    return notes
      .filter(note => {
        const noteDate = new Date(note.created_at);
        return noteDate >= startDate && noteDate <= endDate;
      })
      .reduce((total, note) => {
        return total + calculateWordsInText(note.content);
      }, 0);
  };

  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const wordsPerDay = getWordsPerPeriod(today, today);
  const wordsPerWeek = getWordsPerPeriod(weekStart, weekEnd);
  const wordsPerMonth = getWordsPerPeriod(monthStart, monthEnd);

  const weeklyData = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(date => {
    const dayWords = getWordsPerPeriod(date, date);
    return {
      date: format(date, 'EEE'),
      words: dayWords,
    };
  });

  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const monthDate = subMonths(today, i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    return {
      date: format(start, 'MMM'),
      words: getWordsPerPeriod(start, end),
    };
  }).reverse();

  // Files analysis calculations
  const totalFileSize = files.reduce((sum, file) => sum + file.file_size, 0);
  const avgFileSize = files.length > 0 ? totalFileSize / files.length : 0;
  
  const fileTypes = files.reduce((acc: Record<string, number>, file) => {
    const type = getFileCategory(file.file_type);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const fileTypeData = Object.entries(fileTypes).map(([name, value]) => ({ name, value }));
  
  const fileSizeByType = files.reduce((acc: Record<string, number>, file) => {
    const type = getFileCategory(file.file_type);
    acc[type] = (acc[type] || 0) + file.file_size;
    return acc;
  }, {});

  const fileSizeData = Object.entries(fileSizeByType).map(([name, value]) => ({ 
    name, 
    value: Math.round(value / 1024 / 1024 * 10) / 10
  }));

  const monthlyFileUploads = Array.from({ length: 6 }).map((_, i) => {
    const monthDate = subMonths(new Date(), i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    
    const monthFiles = files.filter(file => {
      const fileDate = new Date(file.created_at);
      return fileDate >= start && fileDate <= end;
    });
    
    return {
      name: format(start, 'MMM'),
      count: monthFiles.length,
      size: Math.round(monthFiles.reduce((sum, file) => sum + file.file_size, 0) / 1024 / 1024 * 10) / 10
    };
  }).reverse();

  const filesPerFolder = files.reduce((acc: Record<string, {count: number, name: string}>, file) => {
    const folderId = file.folder_id || 'root';
    
    if (!acc[folderId]) {
      let folderName = 'Root';
      if (folderId !== 'root') {
        const folder = folders.find(f => f.id === folderId);
        folderName = folder ? folder.name : 'Unknown';
      }
      
      acc[folderId] = { count: 0, name: folderName };
    }
    
    acc[folderId].count += 1;
    return acc;
  }, {});

  const folderWithMostFiles = Object.values(filesPerFolder).sort((a, b) => b.count - a.count)[0];
  
  const folderDepths: Record<string, number> = {};
  
  const calculateFolderDepth = (folderId: string | null): number => {
    if (!folderId) return 0;
    
    if (folderDepths[folderId] !== undefined) {
      return folderDepths[folderId];
    }
    
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return 0;
    
    const depth = 1 + calculateFolderDepth(folder.parent_id);
    folderDepths[folderId] = depth;
    return depth;
  };
  
  folders.forEach(folder => calculateFolderDepth(folder.id));
  
  const maxFolderDepth = Object.values(folderDepths).length > 0 
    ? Math.max(...Object.values(folderDepths))
    : 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  function getFileCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'Images';
    if (mimeType.startsWith('video/')) return 'Videos';
    if (mimeType.startsWith('audio/')) return 'Audio';
    if (mimeType === 'application/pdf') return 'PDFs';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('compress')) return 'Archives';
    if (mimeType.startsWith('text/') || mimeType.includes('document') || mimeType.includes('sheet')) return 'Documents';
    return 'Others';
  }

  function getFileTypeIcon(type: string) {
    switch(type) {
      case 'Images': return <FileImage className="h-4 w-4" />;
      case 'Videos': return <FileVideo className="h-4 w-4" />;
      case 'Audio': return <FileAudio className="h-4 w-4" />;
      case 'PDFs': 
      case 'Documents': return <FileText className="h-4 w-4" />;
      case 'Archives': return <FileArchive className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid gap-6">
            <Skeleton className="h-[400px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px]" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">Analysis</h1>

        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="notes">Notes Analysis</TabsTrigger>
            <TabsTrigger value="files">Files Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Most Used Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {notes.length > 0 ? Object.entries(notes.reduce((acc: Record<string, number>, note) => {
                      acc[note.category] = (acc[note.category] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1])[0][0] : 'N/A'}
                  </div>
                  <p className="text-muted-foreground">
                    {notes.length > 0 ? `${Object.entries(notes.reduce((acc: Record<string, number>, note) => {
                      acc[note.category] = (acc[note.category] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1])[0][1]} notes` : 'No notes yet'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Words Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-muted-foreground">Today:</span>{" "}
                      <span className="font-bold">{notes.filter(note => {
                        const noteDate = new Date(note.created_at);
                        const today = new Date();
                        return noteDate.toDateString() === today.toDateString();
                      }).reduce((total, note) => {
                        return total + note.content.trim().split(/\s+/).length;
                      }, 0)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">This Week:</span>{" "}
                      <span className="font-bold">{notes.filter(note => {
                        const noteDate = new Date(note.created_at);
                        const weekStart = startOfWeek(new Date());
                        const weekEnd = endOfWeek(new Date());
                        return noteDate >= weekStart && noteDate <= weekEnd;
                      }).reduce((total, note) => {
                        return total + note.content.trim().split(/\s+/).length;
                      }, 0)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">This Month:</span>{" "}
                      <span className="font-bold">{notes.filter(note => {
                        const noteDate = new Date(note.created_at);
                        const monthStart = startOfMonth(new Date());
                        const monthEnd = endOfMonth(new Date());
                        return noteDate >= monthStart && noteDate <= monthEnd;
                      }).reduce((total, note) => {
                        return total + note.content.trim().split(/\s+/).length;
                      }, 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {notes.length} Notes
                  </div>
                  <p className="text-muted-foreground">
                    {notes.filter(note => note.is_starred).length} Starred
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eachDayOfInterval({ start: startOfWeek(new Date()), end: endOfWeek(new Date()) }).map(date => {
                    const dayWords = notes.filter(note => {
                      const noteDate = new Date(note.created_at);
                      return noteDate.toDateString() === date.toDateString();
                    }).reduce((total, note) => {
                      return total + note.content.trim().split(/\s+/).length;
                    }, 0);
                    
                    return {
                      date: format(date, 'EEE'),
                      words: dayWords,
                    };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="words" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Array.from({ length: 6 }).map((_, i) => {
                    const monthDate = subMonths(new Date(), i);
                    const start = startOfMonth(monthDate);
                    const end = endOfMonth(monthDate);
                    
                    const monthWords = notes.filter(note => {
                      const noteDate = new Date(note.created_at);
                      return noteDate >= start && noteDate <= end;
                    }).reduce((total, note) => {
                      return total + note.content.trim().split(/\s+/).length;
                    }, 0);
                    
                    return {
                      date: format(start, 'MMM'),
                      words: monthWords,
                    };
                  }).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="words" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <HardDrive className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">
                        {(totalFileSize / (1024 * 1024)).toFixed(2)} MB
                      </div>
                      <p className="text-muted-foreground">
                        {files.length} files in total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average File Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(avgFileSize / 1024).toFixed(2)} KB
                  </div>
                  <p className="text-muted-foreground">
                    Per file average
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Folder With Most Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold truncate" title={folderWithMostFiles?.name || 'N/A'}>
                    {folderWithMostFiles?.name || 'N/A'}
                  </div>
                  <p className="text-muted-foreground">
                    {folderWithMostFiles?.count || 0} files
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Folder Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {folders.length} Folders
                  </div>
                  <p className="text-muted-foreground">
                    Max depth: {maxFolderDepth} levels
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>File Type Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ChartContainer config={{}} className="w-full h-full">
                    <PieChart>
                      <Pie
                        data={fileTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {fileTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Storage by File Type (MB)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fileSizeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} MB`, 'Size']} />
                      <Bar dataKey="value" fill="#8884d8">
                        {fileSizeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly File Upload Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyFileUploads}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Number of Files" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="size" name="Size (MB)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analysis;
