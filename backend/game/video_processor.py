import subprocess
import os

def process_video(
    input_path: str, 
    output_path: str,
    width: int = 1280,
    height: int = 720,
    quality: int = 28,
    blur_sigma: float = 10.0
) -> str:
    """
    비디오를 다운스케일링하고 블러 효과를 적용합니다.

    Args:
        input_path (str): 원본 비디오 파일의 경로.
        output_path (str): 처리된 비디오를 저장할 전체 경로.
        width (int): 출력 비디오의 너비 (픽셀). 기본값 1280.
        height (int): 출력 비디오의 높이 (픽셀). 기본값 720.
        quality (int): 비디오 화질 (CRF 값). 18(고품질)에서 28(낮은 품질) 사이의 값.
                       값이 높을수록 화질은 낮아지고 파일 크기는 작아집니다. 기본값 26.
        blur_sigma (float): 가우시안 블러의 강도. 값이 높을수록 블러가 강해집니다. 기본값 5.0.

    Returns:
        str: 처리된 비디오 파일의 경로.
    
    Raises:
        Exception: ffmpeg 명령 실행 실패 시.
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"원본 비디오 파일을 찾을 수 없습니다: {input_path}")
    
    # 출력 디렉토리가 없으면 생성
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # ffmpeg command: scale down and apply blur
    # scale=-2:720은 비율을 유지하면서 높이를 720으로 설정 (너비는 자동 계산)
    # 또는 scale=1280:720으로 고정 크기로 설정
    command = [
        "ffmpeg",
        "-i", input_path,
        "-vf", f"scale={width}:{height},gblur=sigma={blur_sigma}",
        "-crf", str(quality),
        "-preset", "medium",  # 인코딩 속도와 압축률의 균형
        "-c:v", "libx264",  # H.264 코덱 사용
        "-c:a", "aac",  # 오디오 코덱
        "-movflags", "+faststart",  # 스트리밍 최적화
        "-y",  # 출력 파일 덮어쓰기
        output_path
    ]

    try:
        # Execute the ffmpeg command
        result = subprocess.run(
            command, 
            capture_output=True, 
            text=True, 
            check=True,
            timeout=300  # 5분 타임아웃
        )
        print(f"ffmpeg stdout: {result.stdout}")
        if result.stderr:
            print(f"ffmpeg stderr: {result.stderr}")
        
        if not os.path.exists(output_path):
            raise Exception(f"비디오 처리 후 출력 파일이 생성되지 않았습니다: {output_path}")
        
        return output_path

    except subprocess.TimeoutExpired:
        raise Exception("비디오 처리 시간이 초과되었습니다.")
    except subprocess.CalledProcessError as e:
        print(f"ffmpeg command failed: {e}")
        print(f"ffmpeg stdout: {e.stdout}")
        print(f"ffmpeg stderr: {e.stderr}")
        raise Exception(f"비디오 처리 실패: {e.stderr}")
    except FileNotFoundError:
        raise Exception("ffmpeg를 찾을 수 없습니다. ffmpeg가 설치되어 있고 PATH에 추가되었는지 확인하세요.")
    except Exception as e:
        raise Exception(f"비디오 처리 중 알 수 없는 오류 발생: {e}")

